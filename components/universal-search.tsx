'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRouteDifficultyText } from './route-difficulty';

interface SearchResult {
  id: string;
  title: string;
  type: 'area' | 'route' | 'trip-plan' | 'trip-report';
  slug: string;
  featuredImage?: string;
  excerpt?: string;
  // Type-specific fields
  classRating?: string;
  ydsRating?: string;
  ydsSubRating?: string;
  miles?: number;
  gain?: number;
  parentArea?: string;
  startDate?: string;
  endDate?: string;
}

interface UniversalSearchProps {
  className?: string;
}

export default function UniversalSearch({ className = '' }: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      if (event.key === '/' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      // Fetch all content types
      const [areasRes, routesRes, plansRes, reportsRes] = await Promise.all([
        fetch('/api/search/areas'),
        fetch('/api/search/routes'),
        fetch('/api/search/trip-plans'),
        fetch('/api/search/trip-reports'),
      ]);

      const [areas, routes, plans, reports] = await Promise.all([
        areasRes.json(),
        routesRes.json(),
        plansRes.json(),
        reportsRes.json(),
      ]);

      // Filter results based on query
      const searchLower = searchQuery.toLowerCase();
      const allResults: SearchResult[] = [];

      // Search areas
      areas.forEach((area: any) => {
        if (area.title?.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: area.id,
            title: area.title,
            type: 'area',
            slug: area.slug,
            featuredImage: area.featuredImage,
            excerpt: area.excerpt || ''
          });
        }
      });

      // Search routes
      routes.forEach((route: any) => {
        if (route.title?.toLowerCase().includes(searchLower) || 
            route.parentArea?.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: route.id,
            title: route.title,
            type: 'route',
            slug: route.slug,
            featuredImage: route.featuredImage,
            classRating: route.classRating,
            ydsRating: route.ydsRating,
            ydsSubRating: route.ydsSubRating,
            miles: route.miles,
            gain: route.gain,
            parentArea: route.parentArea
          });
        }
      });

      // Search trip plans
      plans.forEach((plan: any) => {
        if (plan.title?.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: plan.id,
            title: plan.title,
            type: 'trip-plan',
            slug: plan.slug,
            featuredImage: plan.featuredImage,
            startDate: plan.startDate,
            endDate: plan.endDate
          });
        }
      });

      // Search trip reports
      reports.forEach((report: any) => {
        if (report.title?.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: report.id,
            title: report.title,
            type: 'trip-report',
            slug: report.slug,
            featuredImage: report.featuredImage,
            startDate: report.startDate,
            endDate: report.endDate
          });
        }
      });

      // Sort by relevance (exact matches first, then partial matches)
      allResults.sort((a, b) => {
        const aExact = a.title.toLowerCase() === searchLower ? 1 : 0;
        const bExact = b.title.toLowerCase() === searchLower ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        
        const aStarts = a.title.toLowerCase().startsWith(searchLower) ? 1 : 0;
        const bStarts = b.title.toLowerCase().startsWith(searchLower) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        
        return a.title.localeCompare(b.title);
      });

      setResults(allResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'area': return 'bg-blue-100 text-blue-800';
      case 'route': return 'bg-green-100 text-green-800';
      case 'trip-plan': return 'bg-purple-100 text-purple-800';
      case 'trip-report': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'area': return '🏔️';
      case 'route': return '🧗';
      case 'trip-plan': return '📋';
      case 'trip-report': return '📝';
      default: return '📄';
    }
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'area': return `/areas/${result.slug}`;
      case 'route': return `/routes/${result.slug}`;
      case 'trip-plan': return `/trip-plans/${result.slug}`;
      case 'trip-report': return `/trip-reports/${result.slug}`;
      default: return '#';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search routes, areas, plans, reports... (⌘/)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length === 0 && query && !isLoading && (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}
          
          {results.map((result) => (
            <Link
              key={result.id}
              href={getResultLink(result)}
              className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {result.featuredImage ? (
                    <div className="w-12 h-12 relative rounded overflow-hidden">
                      <Image
                        src={result.featuredImage}
                        alt={result.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xl">
                      {getTypeIcon(result.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(result.type)}`}>
                      {result.type.replace('-', ' ')}
                    </span>
                    <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-x-3">
                    {result.type === 'route' && (
                      <>
                        {result.classRating && (
                          <span>🧗 {getRouteDifficultyText({ 
                            classRating: result.classRating,
                            ydsRating: result.ydsRating,
                            ydsSubRating: result.ydsSubRating
                          } as any)}</span>
                        )}
                        {result.miles && <span>📏 {result.miles}mi</span>}
                        {result.parentArea && <span>📍 {result.parentArea}</span>}
                      </>
                    )}
                    {(result.type === 'trip-plan' || result.type === 'trip-report') && (
                      <>
                        {result.startDate && <span>📅 {new Date(result.startDate).toLocaleDateString()}</span>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}