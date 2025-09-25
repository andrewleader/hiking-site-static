'use client';

import { AreaQuery, Area, RouteConnection, Route } from '@/tina/__generated__/types';
import Image from 'next/image';
import Link from 'next/link';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { components } from '@/components/mdx-components';

interface AreaClientPageProps {
  data: AreaQuery;
  variables: {
    relativePath: string;
  };
  query: string;
  routesData: {
    routeConnection: RouteConnection;
  };
}

export default function AreaClientPage({ data, variables, query, routesData }: AreaClientPageProps) {
  const area = data.area as Area;
  const routes = routesData.routeConnection.edges || [];

  const parseCoordinates = (coordString: string | null | undefined) => {
    if (!coordString) return null;
    const parts = coordString.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  };

  const coords = parseCoordinates(area.summitCoords);

  // Get routes that belong to this area
  const areaRoutes = routes.filter(route => {
    if (!route?.node) return false;
    const routeData = route.node as Route;
    
    // Check if parentArea matches this area's file path
    const currentAreaPath = `content/areas/${variables.relativePath}`;
    
    // parentArea can be a string reference or an Area object
    if (typeof routeData.parentArea === 'string') {
      return routeData.parentArea === currentAreaPath;
    } else if (routeData.parentArea && typeof routeData.parentArea === 'object') {
      return routeData.parentArea._sys?.relativePath === variables.relativePath;
    }
    
    return false;
  });

  const formatRouteGrade = (route: Route) => {
    const parts = [];
    
    if (route.classRating) {
      parts.push(route.classRating.replace('class', 'Class '));
    }
    
    if (route.ydsRating) {
      let yds = `5.${route.ydsRating}`;
      if (route.ydsSubRating) {
        yds += route.ydsSubRating;
      }
      parts.push(yds);
    }
    
    return parts.join(' ');
  };

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <nav className="mb-4">
          <Link href="/areas" className="text-green-600 hover:text-green-700">
            ← Back to Areas
          </Link>
        </nav>
        
        <h1 className="text-4xl font-bold mb-4">{area.title}</h1>
        
        {/* Meta information */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {coords && (
            <span>📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
          )}
          {area.mountainForecastUrl && (
            <a 
              href={area.mountainForecastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              🌤️ Weather Forecast
            </a>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {area.featuredImage && (
        <div className="mb-8">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={area.featuredImage}
              alt={area.title || 'Area image'}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {area._body && <TinaMarkdown content={area._body} components={components} />}
      </div>

      {/* Routes in this Area */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          Routes in {area.title}
          <span className="text-lg font-normal text-gray-600 ml-2">
            ({areaRoutes.length})
          </span>
        </h2>
        
        {areaRoutes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {areaRoutes.map((route, index) => {
              if (!route?.node) return null;
              const routeData = route.node as Route;
              const routeSlug = routeData._sys?.relativePath?.replace('.mdx', '') || '';
              
              return (
                <Link 
                  key={index}
                  href={`/routes/${routeSlug}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                >
                  {/* Route Featured Image */}
                  {routeData.featuredImage && (
                    <div className="aspect-video relative mb-4 rounded-md overflow-hidden">
                      <Image
                        src={routeData.featuredImage}
                        alt={routeData.title || 'Route image'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-green-600">
                    {routeData.title}
                  </h3>
                  
                  {/* Route Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {formatRouteGrade(routeData) && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🧗</span>
                        <span>{formatRouteGrade(routeData)}</span>
                      </div>
                    )}
                    
                    {routeData.pitches && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">⛰️</span>
                        <span>{routeData.pitches} pitch{routeData.pitches !== 1 ? 'es' : ''}</span>
                      </div>
                    )}
                    
                    {routeData.miles && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">📏</span>
                        <span>{routeData.miles} miles</span>
                      </div>
                    )}
                    
                    {routeData.gain && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">⬆️</span>
                        <span>+{routeData.gain}ft elevation</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Route Type Badge */}
                  <div className="mt-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Route
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-4xl mb-4">🏔️</div>
            <p className="text-gray-600">No routes found for this area.</p>
            <p className="text-sm text-gray-500 mt-2">
              Routes may be listed under different areas or not yet documented.
            </p>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/routes"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View All Routes
          </Link>
          
          {areaRoutes.length > 0 && (
            <Link 
              href="/map"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View on Map ({areaRoutes.length} route{areaRoutes.length !== 1 ? 's' : ''})
            </Link>
          )}
          
          {coords && (
            <a
              href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open in Google Maps
            </a>
          )}
          
          {area.mountainForecastUrl && (
            <a
              href={area.mountainForecastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Check Weather
            </a>
          )}
        </div>
      </div>
    </article>
  );
}