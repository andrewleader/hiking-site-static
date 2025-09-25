'use client';

import { AreaConnection, RouteConnection, Area, Route } from '@/tina/__generated__/types';
import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface MapClientPageProps {
  areasData: {
    areaConnection: AreaConnection;
  };
  routesData: {
    routeConnection: RouteConnection;
  };
}

interface LocationData {
  id: string;
  title: string;
  type: 'area' | 'route';
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  area?: Area;
  routes?: Route[];
  routeCount?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

// Default center on Washington State (North Cascades area)
const center = {
  lat: 48.5,
  lng: -121.0
};

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

export default function MapClientPage({ areasData, routesData }: MapClientPageProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [mapLocations, setMapLocations] = useState<LocationData[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const areas = areasData.areaConnection.edges || [];
  const routes = routesData.routeConnection.edges || [];

  // Parse coordinates from string format "47.2892, -121.321"
  const parseCoordinates = (coordString: string | null | undefined) => {
    if (!coordString) return null;
    const parts = coordString.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  };

  // Get areas with valid coordinates
  const mappableAreas = areas.filter(area => {
    if (!area?.node) return false;
    return parseCoordinates(area.node.summitCoords) !== null;
  });

  // Get routes for selected area
  const getRoutesForArea = (areaNode: Area) => {
    return routes.filter(route => {
      if (!route?.node) return false;
      return route.node.parentArea === areaNode || 
             (typeof route.node.parentArea === 'object' && 
              route.node.parentArea?._sys?.filename === areaNode._sys?.filename);
    });
  };

  // Prepare location data for the map
  useEffect(() => {
    const locations: LocationData[] = [];

    // Add areas with coordinates
    mappableAreas.forEach((area, index) => {
      if (!area?.node) return;
      
      const areaData = area.node as Area;
      const coords = parseCoordinates(areaData.summitCoords);
      if (!coords) return;

      const areaRoutes = getRoutesForArea(areaData);
      
      locations.push({
        id: `area-${index}`,
        title: areaData.title || 'Unnamed Area',
        type: 'area',
        coordinates: coords,
        area: areaData,
        routes: areaRoutes.map(r => r?.node as Route).filter(Boolean),
        routeCount: areaRoutes.length
      });
    });

    // Add routes with coordinates (that aren't already covered by their area)
    routes.forEach((route, index) => {
      if (!route?.node) return;
      
      const routeData = route.node as Route;
      const routeCoords = parseCoordinates(routeData.summitCoords);
      if (!routeCoords) return;

      // Check if this route's area already has coordinates on the map
      const hasAreaOnMap = mappableAreas.some(area => {
        if (!area?.node) return false;
        const areaData = area.node as Area;
        return routeData.parentArea === areaData || 
               (typeof routeData.parentArea === 'object' && 
                routeData.parentArea?._sys?.filename === areaData._sys?.filename);
      });

      // Only add routes whose areas don't have coordinates (or standalone routes)
      if (!hasAreaOnMap) {
        locations.push({
          id: `route-${index}`,
          title: routeData.title || 'Unnamed Route',
          type: 'route',
          coordinates: routeCoords,
          routes: [routeData]
        });
      }
    });

    setMapLocations(locations);
  }, [areas, routes]);

  const handleMarkerClick = useCallback((location: LocationData) => {
    setSelectedLocation(location);
    setSelectedArea(location.area || null);
  }, []);

  const getHighestDifficulty = (routes: Route[]) => {
    if (!routes || routes.length === 0) return 'none';
    
    const difficulties = routes.map(route => route.classRating).filter(Boolean);
    
    if (difficulties.includes('class5')) return 'class5';
    if (difficulties.includes('class4')) return 'class4';
    if (difficulties.includes('class3')) return 'class3';
    if (difficulties.includes('class2')) return 'class2';
    return 'none';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'class5': return '#dc2626'; // Red
      case 'class4': return '#ea580c'; // Orange
      case 'class3': return '#f59e0b'; // Yellow-orange
      case 'class2': 
      case 'none':
      default: return '#16a34a'; // Green
    }
  };

  const getMarkerIcon = (location: LocationData) => {
    // Check if Google Maps API is loaded
    if (!isGoogleMapsLoaded || typeof window === 'undefined' || !window.google || !window.google.maps) {
      return undefined;
    }

    const highestDifficulty = getHighestDifficulty(location.routes || []);
    const color = getDifficultyColor(highestDifficulty);

    if (location.type === 'area') {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10
      };
    } else if (location.type === 'route') {
      // Use the same circle marker for individual routes
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10
      };
    }
    return undefined;
  };

  const handleGoogleMapsLoad = useCallback(() => {
    setIsGoogleMapsLoaded(true);
  }, []);

  const handleGoogleMapsError = useCallback((error: Error) => {
    console.error('Error loading Google Maps:', error);
  }, []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Interactive Map</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-red-900 mb-3">Google Maps API Key Required</h3>
          <p className="text-red-800 mb-3">
            To view the interactive map, you need to configure a Google Maps API key.
          </p>
          <p className="text-red-700 text-sm">
            Add <code className="bg-red-100 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here</code> to your .env.local file.
          </p>
        </div>

        {/* Fallback: Show locations list */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Mappable Locations</h2>
            <div className="space-y-4">
              {mappableAreas.map((area, index) => {
                if (!area?.node) return null;
                
                const areaData = area.node as Area;
                const coords = parseCoordinates(areaData.summitCoords);
                const areaRoutes = getRoutesForArea(areaData);
                
                return (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedArea === areaData 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedArea(selectedArea === areaData ? null : areaData)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        area
                      </span>
                      <h3 className="font-semibold text-lg">{areaData.title}</h3>
                    </div>
                    {coords && (
                      <p className="text-sm text-gray-600">
                        📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </p>
                    )}
                    <p className="text-sm text-blue-600">
                      {areaRoutes.length} route{areaRoutes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
              
              {/* Show routes with coordinates that don't have area coordinates */}
              {routes.filter(route => {
                if (!route?.node) return false;
                const routeData = route.node as Route;
                const routeCoords = parseCoordinates(routeData.summitCoords);
                if (!routeCoords) return false;
                
                const hasAreaOnMap = mappableAreas.some(area => {
                  if (!area?.node) return false;
                  const areaData = area.node as Area;
                  return routeData.parentArea === areaData || 
                         (typeof routeData.parentArea === 'object' && 
                          routeData.parentArea?._sys?.filename === areaData._sys?.filename);
                });
                
                return !hasAreaOnMap;
              }).map((route, index) => {
                if (!route?.node) return null;
                
                const routeData = route.node as Route;
                const coords = parseCoordinates(routeData.summitCoords);
                
                return (
                  <div
                    key={`route-${index}`}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        route
                      </span>
                      <h3 className="font-semibold text-lg">{routeData.title}</h3>
                    </div>
                    {coords && (
                      <p className="text-sm text-gray-600">
                        📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </p>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      {routeData.classRating && (
                        <span>🧗 {routeData.classRating.replace('class', 'Class ')}</span>
                      )}
                      {routeData.miles && (
                        <span className="ml-2">📏 {routeData.miles}mi</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {mappableAreas.length === 0 && (
              <p className="text-gray-500">No locations with coordinates found.</p>
            )}
          </div>

          {/* Selected Area Details */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {selectedArea ? `Routes in ${selectedArea.title}` : 'Select an area to view routes'}
            </h2>
            
            {selectedArea && (
              <div className="space-y-4">
                {getRoutesForArea(selectedArea).map((route, index) => {
                  if (!route?.node) return null;
                  
                  const routeData = route.node as Route;
                  
                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold">{routeData.title}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {routeData.miles && <span>📏 {routeData.miles} mi</span>}
                        {routeData.gain && <span className="ml-3">⬆️ {routeData.gain}ft</span>}
                        {routeData.classRating && (
                          <span className="ml-3">🧗 {routeData.classRating.replace('class', 'Class ')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {getRoutesForArea(selectedArea).length === 0 && (
                  <p className="text-gray-500">No routes found for this area.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Interactive Climbing Map</h1>
        <p className="text-gray-600 mb-4">
          Explore climbing areas and routes on an interactive map. Click markers for details.
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span>Class 5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Class 4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>Class 3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span>Class 2/None</span>
            </div>
          </div>
          <div className="text-gray-600">
            ({mapLocations.filter(l => l.type === 'area').length} areas, {mapLocations.filter(l => l.type === 'route').length} routes)
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="mb-8">
        <LoadScript 
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
          onLoad={handleGoogleMapsLoad}
          onError={handleGoogleMapsError}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={7}
            options={mapOptions}
          >
            {isGoogleMapsLoaded && mapLocations.map((location) => (
              <Marker
                key={location.id}
                position={location.coordinates}
                icon={getMarkerIcon(location)}
                onClick={() => handleMarkerClick(location)}
              />
            ))}

            {!isGoogleMapsLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}

            {selectedLocation && (
              <InfoWindow
                position={selectedLocation.coordinates}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div className="max-w-sm">
                  {/* Show route info directly if it's an area with exactly 1 route */}
                  {selectedLocation.type === 'area' && selectedLocation.routes && selectedLocation.routes.length === 1 ? (
                    <>
                      <h3 className="font-bold text-lg mb-2">{selectedLocation.routes[0].title}</h3>
                      <div className="mb-3">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          route
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          in {selectedLocation.title}
                        </span>
                        {selectedLocation.routes[0].classRating && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {selectedLocation.routes[0].classRating.replace('class', 'Class ')}
                          </span>
                        )}
                      </div>
                      
                      {/* Route details */}
                      <div className="mb-3 text-sm text-gray-600">
                        {selectedLocation.routes[0].miles && (
                          <div>📏 {selectedLocation.routes[0].miles} miles</div>
                        )}
                        {selectedLocation.routes[0].gain && (
                          <div>⬆️ {selectedLocation.routes[0].gain}ft gain</div>
                        )}
                        {selectedLocation.routes[0].highestElevation && (
                          <div>🏔️ {selectedLocation.routes[0].highestElevation}ft elevation</div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          📍 {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                        </p>
                        {selectedLocation.routes[0]._sys?.filename && (
                          <a 
                            href={`/routes/${selectedLocation.routes[0]._sys.filename.replace('.mdx', '')}`}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium block"
                            target="_blank"
                          >
                            View Route Details →
                          </a>
                        )}
                        {selectedLocation.area?._sys?.filename && (
                          <a 
                            href={`/areas/${selectedLocation.area._sys.filename.replace('.mdx', '')}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium block"
                            target="_blank"
                          >
                            View Area Details →
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-lg mb-2">{selectedLocation.title}</h3>
                      <div className="mb-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          selectedLocation.type === 'area' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {selectedLocation.type}
                        </span>
                        {selectedLocation.type === 'area' && selectedLocation.routeCount !== undefined && (
                          <span className="ml-2 text-sm text-gray-600">
                            {selectedLocation.routeCount} route{selectedLocation.routeCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {selectedLocation.routes && selectedLocation.routes.length > 0 && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {selectedLocation.type === 'route' 
                              ? selectedLocation.routes[0].classRating?.replace('class', 'Class ') || 'Unspecified'
                              : `Max: ${getHighestDifficulty(selectedLocation.routes).replace('class', 'Class ') || 'Unspecified'}`
                            }
                          </span>
                        )}
                      </div>
                      
                      {/* Route-specific details for single routes */}
                      {selectedLocation.type === 'route' && selectedLocation.routes && selectedLocation.routes[0] && (
                        <div className="mb-3 text-sm text-gray-600">
                          {selectedLocation.routes[0].miles && (
                            <div>📏 {selectedLocation.routes[0].miles} miles</div>
                          )}
                          {selectedLocation.routes[0].gain && (
                            <div>⬆️ {selectedLocation.routes[0].gain}ft gain</div>
                          )}
                          {selectedLocation.routes[0].highestElevation && (
                            <div>🏔️ {selectedLocation.routes[0].highestElevation}ft elevation</div>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          📍 {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                        </p>
                        {selectedLocation.area?._sys?.filename && (
                          <a 
                            href={`/areas/${selectedLocation.area._sys.filename.replace('.mdx', '')}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium block"
                            target="_blank"
                          >
                            View Area Details →
                          </a>
                        )}
                        {selectedLocation.type === 'route' && selectedLocation.routes && selectedLocation.routes[0]?._sys?.filename && (
                          <a 
                            href={`/routes/${selectedLocation.routes[0]._sys.filename.replace('.mdx', '')}`}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium block"
                            target="_blank"
                          >
                            View Route Details →
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Locations List */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Mappable Locations</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {mapLocations.map((location) => (
              <div
                key={location.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedLocation === location 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    location.type === 'area' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {location.type}
                  </span>
                  <h3 className="font-semibold text-lg">{location.title}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  📍 {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                </p>
                {location.type === 'area' && (
                  <p className="text-sm text-blue-600">
                    {location.routeCount} route{location.routeCount !== 1 ? 's' : ''}
                  </p>
                )}
                {location.type === 'route' && location.routes && location.routes[0] && (
                  <div className="text-sm text-gray-600 mt-1">
                    {location.routes[0].classRating && (
                      <span>🧗 {location.routes[0].classRating.replace('class', 'Class ')}</span>
                    )}
                    {location.routes[0].miles && (
                      <span className="ml-2">📏 {location.routes[0].miles}mi</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {mapLocations.length === 0 && (
            <p className="text-gray-500">No locations with coordinates found.</p>
          )}
        </div>

        {/* Selected Area Details */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedArea ? `Routes in ${selectedArea.title}` : 'Select an area to view routes'}
          </h2>
          
          {selectedArea && (
            <div className="space-y-4">
              {getRoutesForArea(selectedArea).map((route, index) => {
                if (!route?.node) return null;
                
                const routeData = route.node as Route;
                
                return (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex gap-3">
                      {/* Featured image thumbnail */}
                      <div className="flex-shrink-0">
                        {routeData.featuredImage ? (
                          <img 
                            src={routeData.featuredImage} 
                            alt={routeData.title || 'Route image'}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">🏔️</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Route content */}
                      <div className="flex-1">
                        <h4 className="font-semibold">{routeData.title}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {routeData.miles && <span>📏 {routeData.miles} mi</span>}
                          {routeData.gain && <span className="ml-3">⬆️ {routeData.gain}ft</span>}
                          {routeData.classRating && (
                            <span className="ml-3">🧗 {routeData.classRating.replace('class', 'Class ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {getRoutesForArea(selectedArea).length === 0 && (
                <p className="text-gray-500">No routes found for this area.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}