'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { XIcon } from 'lucide-react';

interface ImageData {
  src: string;
  alt?: string;
  type?: 'normal' | 'route-overlay';
  overlaySrc?: string; // For route overlay images
}

interface ImageGalleryProps {
  images: ImageData[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [hideOverlay, setHideOverlay] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setHideOverlay(false); // Reset overlay visibility when changing images
  }, [initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setHideOverlay(false); // Reset overlay visibility when navigating
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setHideOverlay(false); // Reset overlay visibility when navigating
  }, [images.length]);

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isDownSwipe = distanceY < -100;

    // Prioritize vertical swipe for closing
    if (Math.abs(distanceY) > Math.abs(distanceX) && isDownSwipe) {
      onClose();
    } else if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe for navigation
      if (isLeftSwipe && images.length > 1) {
        goToNext();
      } else if (isRightSwipe && images.length > 1) {
        goToPrevious();
      }
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      ref={galleryRef}
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === galleryRef.current) {
          onClose();
        }
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Close gallery"
      >
        <XIcon className="w-8 h-8" />
      </button>

      {/* Navigation buttons - only show if more than one image */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Previous image"
          >
            <BiChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Next image"
          >
            <BiChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Image container */}
      <div className="flex flex-col items-center justify-center max-w-full max-h-full p-4">
        {/* Route Overlay Image */}
        {currentImage.type === 'route-overlay' ? (
          <div className="relative">
            <img
              src={currentImage.src}
              alt={currentImage.alt || ''}
              className="max-w-full max-h-[80vh] object-contain"
              draggable={false}
            />
            
            {/* Overlay image */}
            {currentImage.overlaySrc && !hideOverlay && (
              <img
                src={currentImage.overlaySrc}
                alt="Route overlay"
                className="absolute top-0 left-0 w-full h-full object-contain"
                style={{ pointerEvents: 'none' }}
                draggable={false}
              />
            )}
            
            {/* Hide overlay control for route overlays */}
            {currentImage.overlaySrc && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded px-3 py-2">
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
        ) : (
          /* Regular Image */
          <img
            src={currentImage.src}
            alt={currentImage.alt || ''}
            className="max-w-full max-h-[80vh] object-contain"
            draggable={false}
          />
        )}

        {/* Caption */}
        {currentImage.alt && (
          <div className="mt-4 max-w-2xl text-center text-white text-lg bg-black bg-opacity-50 px-4 py-2 rounded">
            {currentImage.alt}
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="mt-2 text-white text-sm opacity-75">
            {currentIndex + 1} of {images.length}
          </div>
        )}
      </div>

      {/* Swipe indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs opacity-50 text-center">
        {images.length > 1 && <div>Swipe left/right to navigate</div>}
        <div>Swipe down to close</div>
      </div>
    </div>
  );
};