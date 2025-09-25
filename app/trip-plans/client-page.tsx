'use client';

import { TripPlan, TripPlanConnection } from '@/tina/__generated__/types';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface TripPlansClientPageProps {
  data: {
    tripPlanConnection: TripPlanConnection;
  };
}

export default function TripPlansClientPage({ data }: TripPlansClientPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const tripPlans = data.tripPlanConnection.edges || [];
  
  // Sort by start date descending (most recent first), with null dates at the end
  const sortedTripPlans = [...tripPlans].sort((a, b) => {
    const aDate = a?.node?.startDate;
    const bDate = b?.node?.startDate;
    
    // If both have no date, maintain original order
    if (!aDate && !bDate) return 0;
    
    // If only a has no date, put it at the end
    if (!aDate && bDate) return 1;
    
    // If only b has no date, put it at the end
    if (aDate && !bDate) return -1;
    
    // If both have dates, sort by date descending
    if (aDate && bDate) {
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    
    return 0;
  });
  
  const filteredTripPlans = sortedTripPlans.filter((plan) => {
    if (!plan?.node) return false;
    const title = plan.node.title?.toLowerCase() || '';
    return title.includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Trip Plans</h1>
      
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search trip plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Trip Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTripPlans.map((plan, index) => {
          if (!plan?.node) return null;
          
          const planData = plan.node as TripPlan;
          const slug = plan.node._sys?.filename || `plan-${index}`;
          
          return (
            <Link
              key={slug}
              href={`/trip-plans/${slug}`}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {planData.featuredImage && (
                <div className="aspect-video relative">
                  <Image
                    src={planData.featuredImage}
                    alt={planData.title || 'Trip plan image'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                  {planData.title}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  {planData.startDate && (
                    <p>📅 Start: {formatDate(planData.startDate)}</p>
                  )}
                  {planData.endDate && (
                    <p>📅 End: {formatDate(planData.endDate)}</p>
                  )}
                  {planData.destinations && planData.destinations.length > 0 && (
                    <p>📍 {planData.destinations.length} destination{planData.destinations.length > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTripPlans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No trip plans found matching your search.' : 'No trip plans available yet.'}
          </p>
        </div>
      )}
    </div>
  );
}