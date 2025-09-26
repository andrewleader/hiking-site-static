import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import BetaCreator from '../betacreator/src/components/BetaCreator';
import type { BetaCreatorRef } from '../betacreator/src/components/BetaCreator';

// Import the betacreator styles
import '../betacreator/src/styles/betacreator-react.css';

interface RouteOverlayData {
  topoData: string;
  topoOverlaySrc?: string;
}

export default function RouteOverlayEditorPage() {
  const betaCreatorRef = useRef<BetaCreatorRef>(null);
  const [baseImageSrc, setBaseImageSrc] = useState<string|null>(null);
  const [routeData, setRouteData] = useState<RouteOverlayData>({
    topoData: '{"items":[]}',
    topoOverlaySrc: ''
  });
  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const imageSrc = event.target.value;
    setBaseImageSrc(imageSrc);
  };

  const handleGenerateOverlay = () => {
    if (betaCreatorRef.current) {
      try {
        const topoData = betaCreatorRef.current.getData();
        const overlayImage = betaCreatorRef.current.getImage(false);
        
        const newData = {
          ...routeData,
          topoData: topoData,
          topoOverlaySrc: overlayImage,
        };
        
        setRouteData(newData);
        localStorage.setItem('routeOverlayEditorData', JSON.stringify(newData));
        
        alert('Route overlay generated successfully!');
      } catch (error) {
        console.error('Error getting BetaCreator data:', error);
        alert('Error generating route overlay. Please try again.');
      }
    }
  };

  const handleReady = () => {
    console.log('BetaCreator is ready!');
  };

  const handleChange = () => {
    console.log('Route data changed');
  };

  const handleError = (error: string) => {
    console.error('BetaCreator error:', error);
    alert(`Error: ${error}`);
  };

  // Parse current topo data for display purposes only
  const currentTopoData = (() => {
    try {
      return JSON.parse(routeData.topoData);
    } catch {
      return { items: [] };
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Route Overlay Editor</h1>
          
          {/* Image Input Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">1. Select Base Image & Load Data</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={baseImageSrc || ''}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Existing Topo Data (Optional)</label>
                <textarea
                  value={routeData.topoData}
                  onChange={(e) => setRouteData({ ...routeData, topoData: e.target.value })}
                  placeholder='{"items":[]}'
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Paste existing topo data JSON here to edit an existing route overlay
                </div>
              </div>
            </div>
          </div>

          {/* BetaCreator Editor Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">2. Edit Route Overlay</h2>
            
            <div className="border rounded-lg bg-white p-4">
              <BetaCreator
                ref={betaCreatorRef}
                src={baseImageSrc || ''}
                initialData={routeData.topoData}
                width={800}
                height={600}
                zoom="contain"
                onReady={handleReady}
                onChange={handleChange}
                onError={handleError}
              />
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={handleGenerateOverlay}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                Generate Route Overlay
              </button>
              <div className="text-sm text-gray-600">
                Click this button after drawing your route to generate the overlay data and image.
              </div>
            </div>
            
            {currentTopoData.items && currentTopoData.items.length > 0 && (
              <div className="mt-4 text-green-600">
                ✓ Route overlay configured ({currentTopoData.items.length} items)
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">3. Copy Component Code & Data</h2>
            
            <div className="space-y-6">
              {/* Topo Data */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Topo Data (JSON):</label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(routeData?.topoData || '').then(() => {
                        alert('Topo data copied to clipboard!');
                      });
                    }}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                  >
                    Copy Topo Data
                  </button>
                </div>
                <textarea
                  value={routeData?.topoData || ''}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 font-mono text-sm"
                />
              </div>

              {/* Overlay Image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Overlay Image (Base64):</label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(routeData?.topoOverlaySrc || '').then(() => {
                        alert('Overlay image data copied to clipboard!');
                      });
                    }}
                    className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
                  >
                    Copy Overlay Image
                  </button>
                </div>
                <textarea
                  value={routeData?.topoOverlaySrc || ''}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {routeData.topoOverlaySrc && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">4. Preview</h2>
              <div className="relative inline-block" style={{position: 'relative'}}>
                <img 
                  src={baseImageSrc || ''} 
                  alt="Base image" 
                  className="max-w-md"
                />
                <img 
                  src={routeData.topoOverlaySrc} 
                  alt="Route overlay" 
                  style={{position: 'absolute', left: 0, top: 0}}
                  className="absolute inset-0 max-w-md"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}