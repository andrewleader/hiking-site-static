'use client';

import { RouteQuery, Route } from '@/tina/__generated__/types';
import Image from 'next/image';
import Link from 'next/link';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { components } from '@/components/mdx-components';

interface RouteClientPageProps {
  data: RouteQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function RouteClientPage({ data, variables, query }: RouteClientPageProps) {
  const route = data.route as Route;

  const formatDifficulty = () => {
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
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <nav className="mb-4">
          <Link href="/routes" className="text-green-600 hover:text-green-700">
            ← Back to Routes
          </Link>
        </nav>
        
        <h1 className="text-4xl font-bold mb-4">{route.title}</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {route.miles && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{route.miles}</div>
              <div className="text-sm text-gray-600">Miles</div>
            </div>
          )}
          {route.gain && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{route.gain.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Elevation Gain (ft)</div>
            </div>
          )}
          {route.highestElevation && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{route.highestElevation.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Max Elevation (ft)</div>
            </div>
          )}
          {route.classRating && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{formatDifficulty()}</div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
          )}
        </div>

        {/* Additional Route Info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {route.pitches && route.classRating === 'class5' && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
              🧗 {route.pitches} pitch{route.pitches > 1 ? 'es' : ''}
            </span>
          )}
          {route.parentArea && typeof route.parentArea === 'object' && route.parentArea.title && (
            <Link 
              href={`/areas/${route.parentArea._sys?.filename}`}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              📍 {route.parentArea.title}
            </Link>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {route.featuredImage && (
        <div className="mb-8">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={route.featuredImage}
              alt={route.title || 'Route image'}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {route._body && <TinaMarkdown content={route._body} components={components} />}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Resources</h3>
        <div className="flex flex-wrap gap-4">
          {route.calTopoUrl && (
            <a
              href={route.calTopoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🗺️ CalTopo Map
            </a>
          )}
          
          {route.gpxFile && (
            <a
              href={route.gpxFile}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📱 Download GPX
            </a>
          )}
          
          {route.mountainForecastUrl && (
            <a
              href={route.mountainForecastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🌤️ Weather Forecast
            </a>
          )}
        </div>
      </div>
    </article>
  );
}