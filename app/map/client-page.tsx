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

    if (location.type === 'area') {
      const highestDifficulty = getHighestDifficulty(location.routes || []);
      const color = getDifficultyColor(highestDifficulty);
      
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

        {/* Fallback: Show areas list */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Areas with Coordinates</h2>
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
                    <h3 className="font-semibold text-lg">{areaData.title}</h3>
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
            </div>
            
            {mappableAreas.length === 0 && (
              <p className="text-gray-500">No areas with coordinates found.</p>
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
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            <span>Class 5 Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
            <span>Class 4 Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Class 3 Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            <span>Class 2/No Routes</span>
          </div>
          <div className="text-gray-600">
            ({mapLocations.length} total areas)
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
                  <h3 className="font-bold text-lg mb-2">{selectedLocation.title}</h3>
                  <div className="mb-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {selectedLocation.type}
                    </span>
                    {selectedLocation.routeCount !== undefined && (
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedLocation.routeCount} route{selectedLocation.routeCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {selectedLocation.routes && selectedLocation.routes.length > 0 && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Max: {getHighestDifficulty(selectedLocation.routes).replace('class', 'Class ') || 'Unspecified'}
                      </span>
                    )}
                  </div>
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
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Areas List */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Areas with Coordinates</h2>
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
                  <h3 className="font-semibold text-lg">{areaData.title}</h3>
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
          </div>
          
          {mappableAreas.length === 0 && (
            <p className="text-gray-500">No areas with coordinates found.</p>
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