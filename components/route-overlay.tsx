'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

interface RouteOverlayProps {
  imageSrc: string;
  topoData?: string;
  topoOverlaySrc?: string;
}

export const RouteOverlay: React.FC<RouteOverlayProps> = ({
  imageSrc,
  topoData,
  topoOverlaySrc,
}) => {
  const [hideOverlay, setHideOverlay] = useState(false);

  const openEditor = useCallback(() => {
    // Open the route overlay editor in a new tab/window
    const params = new URLSearchParams();
    params.set('imageSrc', imageSrc);
    if (topoData) {
      params.set('topoData', topoData);
    }
    if (topoOverlaySrc) {
      params.set('topoOverlaySrc', topoOverlaySrc);
    }
    const editorUrl = `/route-overlay-editor?${params.toString()}`;
    window.open(editorUrl, '_blank', 'width=1200,height=800');
  }, [imageSrc, topoData, topoOverlaySrc]);

  return (
    <div className="relative inline-block max-w-full" data-route-overlay="true">
      {/* Base image */}
      <Image
        src={imageSrc}
        alt="Route image"
        width={800}
        height={600}
        className="max-w-full h-auto"
        style={{ objectFit: 'contain', marginTop: 0, marginBottom: 0, maxHeight: '600px' }}
      />
      
      {/* Overlay image */}
      {topoOverlaySrc && !hideOverlay && (
        <Image
          src={topoOverlaySrc}
          alt="Route overlay"
          fill
          className="max-w-full h-auto"
          style={{ position: 'absolute', top: 0, left: 0, objectFit: 'contain', marginTop: 0, marginBottom: 0, maxHeight: '600px', pointerEvents: 'none' }}
        />
      )}
      
      {/* Controls */}
      <div className="absolute bottom-2 left-2 flex gap-2">
        {topoOverlaySrc && (
          <div className="bg-black bg-opacity-50 rounded px-2 py-1">
            <label className="flex items-center text-white text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={hideOverlay}
                onChange={(e) => setHideOverlay(e.target.checked)}
                className="mr-2"
              />
              Hide overlay
            </label>
          </div>
        )}
        
        {/* Edit button */}
        <button
          onClick={openEditor}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
          title="Edit route overlay"
        >
          ✏️ Edit
        </button>
      </div>
    </div>
  );
};