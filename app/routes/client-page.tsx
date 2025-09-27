'use client';

import { Route, RouteConnectionQuery } from '@/tina/__generated__/types';
import { useState } from 'react';
import { RouteCard } from '@/components/route-card';

interface RoutesClientPageProps {
  data: RouteConnectionQuery;
}

export default function RoutesClientPage({ data }: RoutesClientPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  const routes = data.routeConnection.edges || [];
  
  const filteredRoutes = routes.filter((route: any) => {
    if (!route?.node) return false;
    const title = route.node.title?.toLowerCase() || '';
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesClass = !classFilter || route.node.classRating === classFilter;
    return matchesSearch && matchesClass;
  });



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
        {filteredRoutes.map((route: any, index: number) => {
          if (!route?.node) return null;
          
          const routeData = route.node as Route;
          
          return (
            <RouteCard 
              key={route.node._sys?.filename || `route-${index}`}
              route={routeData}
              size="large"
            />
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