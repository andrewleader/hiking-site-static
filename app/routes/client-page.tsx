'use client';

import { Route, RouteConnection } from '@/tina/__generated__/types';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface RoutesClientPageProps {
  data: {
    routeConnection: RouteConnection;
  };
}

export default function RoutesClientPage({ data }: RoutesClientPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  const routes = data.routeConnection.edges || [];
  
  const filteredRoutes = routes.filter((route) => {
    if (!route?.node) return false;
    const title = route.node.title?.toLowerCase() || '';
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesClass = !classFilter || route.node.classRating === classFilter;
    return matchesSearch && matchesClass;
  });

  const formatDifficulty = (route: Route) => {
    const parts = [];
    if (route.classRating) {
      parts.push(route.classRating.replace('class', 'Class '));
    }
    if (route.classRating === 'class5' && route.ydsRating) {
      let yds = route.ydsRating;
      if (route.ydsSubRating && route.ydsSubRating !== 'none') {
        yds += route.ydsSubRating;
      }
      parts.push(`(${yds})`);
    }
    return parts.join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Climbing & Hiking Routes</h1>
      
      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search routes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Classes</option>
          <option value="class2">Class 2</option>
          <option value="class3">Class 3</option>
          <option value="class4">Class 4</option>
          <option value="class5">Class 5</option>
        </select>
      </div>

      {/* Routes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoutes.map((route, index) => {
          if (!route?.node) return null;
          
          const routeData = route.node as Route;
          const slug = route.node._sys?.filename || `route-${index}`;
          
          return (
            <Link
              key={slug}
              href={`/routes/${slug}`}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {routeData.featuredImage && (
                <div className="aspect-video relative">
                  <Image
                    src={routeData.featuredImage}
                    alt={routeData.title || 'Route image'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                  {routeData.title}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  {routeData.miles && (
                    <p>📏 {routeData.miles} miles</p>
                  )}
                  {routeData.gain && (
                    <p>⬆️ {routeData.gain.toLocaleString()}ft gain</p>
                  )}
                  {routeData.highestElevation && (
                    <p>🏔️ {routeData.highestElevation.toLocaleString()}ft max</p>
                  )}
                  {routeData.classRating && (
                    <p className="font-medium text-orange-500">
                      🧗 {formatDifficulty(routeData)}
                    </p>
                  )}
                </div>
                
                {routeData.parentArea && typeof routeData.parentArea === 'object' && routeData.parentArea.title && (
                  <p className="text-blue-600 text-sm">
                    📍 Area: {routeData.parentArea.title}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || classFilter ? 'No routes found matching your filters.' : 'No routes available yet.'}
          </p>
        </div>
      )}
    </div>
  );
}