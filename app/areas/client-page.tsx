'use client';

import { Area, AreaConnectionQuery } from '@/tina/__generated__/types';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface AreasClientPageProps {
  data: AreaConnectionQuery;
}

export default function AreasClientPage({ data }: AreasClientPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const areas = data.areaConnection.edges || [];
  
  const filteredAreas = areas.filter((area: any) => {
    if (!area?.node) return false;
    const title = area.node.title?.toLowerCase() || '';
    return title.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Climbing & Hiking Areas</h1>
      
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search areas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Areas Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAreas.map((area: any, index: number) => {
          if (!area?.node) return null;
          
          const areaData = area.node as Area;
          const slug = area.node._sys?.filename || `area-${index}`;
          
          return (
            <Link
              key={slug}
              href={`/areas/${slug}`}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {areaData.featuredImage && (
                <div className="aspect-video relative">
                  <Image
                    src={areaData.featuredImage}
                    alt={areaData.title || 'Area image'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                  {areaData.title}
                </h3>
                
                {areaData.summitCoords && (
                  <p className="text-gray-600 text-sm mb-2">
                    📍 {areaData.summitCoords}
                  </p>
                )}
                
                {areaData.mountainForecastUrl && (
                  <p className="text-blue-600 text-sm">
                    Weather forecast available
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredAreas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No areas found matching your search.' : 'No areas available yet.'}
          </p>
        </div>
      )}
    </div>
  );
}