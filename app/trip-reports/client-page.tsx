'use client';

import { TripReport, TripReportConnection } from '@/tina/__generated__/types';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface TripReportsClientPageProps {
  data: {
    tripReportConnection: TripReportConnection;
  };
}

export default function TripReportsClientPage({ data }: TripReportsClientPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const tripReports = data.tripReportConnection.edges || [];
  
  // Sort by start date descending (most recent first), with null dates at the end
  const sortedTripReports = [...tripReports].sort((a, b) => {
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
  
  const filteredTripReports = sortedTripReports.filter((report) => {
    if (!report?.node) return false;
    const title = report.node.title?.toLowerCase() || '';
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
      <h1 className="text-4xl font-bold mb-8">Trip Reports</h1>
      
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search trip reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Trip Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTripReports.map((report, index) => {
          if (!report?.node) return false;
          
          const reportData = report.node as TripReport;
          const slug = report.node._sys?.filename || `report-${index}`;
          
          return (
            <Link
              key={slug}
              href={`/trip-reports/${slug}`}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {reportData.featuredImage && (
                <div className="aspect-video relative">
                  <Image
                    src={reportData.featuredImage}
                    alt={reportData.title || 'Trip report image'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                  {reportData.title}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  {reportData.startDate && (
                    <p>📅 Start: {formatDate(reportData.startDate)}</p>
                  )}
                  {reportData.endDate && (
                    <p>📅 End: {formatDate(reportData.endDate)}</p>
                  )}
                  {reportData.destinations && reportData.destinations.length > 0 && (
                    <p>📍 {reportData.destinations.length} destination{reportData.destinations.length > 1 ? 's' : ''}</p>
                  )}
                  {reportData.tripPlan && typeof reportData.tripPlan === 'object' && reportData.tripPlan.title && (
                    <p className="text-blue-600">🗓️ Based on plan: {reportData.tripPlan.title}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTripReports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No trip reports found matching your search.' : 'No trip reports available yet.'}
          </p>
        </div>
      )}
    </div>
  );
}