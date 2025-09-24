'use client';

import React, { useState } from 'react';
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

  return (
    <div className="relative inline-block max-w-full">
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
      
      {/* Hide overlay control */}
      {topoOverlaySrc && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1">
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
    </div>
  );
};