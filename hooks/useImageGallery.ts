'use client';

import { useState, useEffect, useCallback } from 'react';

interface ImageData {
  src: string;
  alt?: string;
  element: HTMLImageElement;
  type?: 'normal' | 'route-overlay';
  overlaySrc?: string; // For route overlay images
}

export const useImageGallery = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const detectImages = useCallback(() => {
    // Find all images in the content area
    const contentSelectors = [
      '.prose', // Common Tailwind prose class
      'article',
      'main',
      '[data-content]',
      '.content'
    ];

    let contentArea: Element | null = null;
    for (const selector of contentSelectors) {
      contentArea = document.querySelector(selector);
      if (contentArea) break;
    }

    // Fallback to body if no content area found
    if (!contentArea) {
      contentArea = document.body;
    }

    const imageElements = contentArea.querySelectorAll('img');
    const imageData: ImageData[] = [];
    const processedRouteOverlays = new Set<HTMLElement>();

    imageElements.forEach((img) => {
      // Skip images that are too small (likely icons or UI elements)
      if (img.naturalWidth < 100 || img.naturalHeight < 100) {
        return;
      }

      // Skip images with specific classes that indicate UI elements
      const skipClasses = ['icon', 'avatar', 'logo', 'ui-'];
      const shouldSkip = skipClasses.some(cls => 
        img.className.toLowerCase().includes(cls)
      );

      if (shouldSkip) {
        return;
      }

      // Check if this is part of a RouteOverlay component
      const routeOverlayContainer = img.closest('[data-route-overlay="true"]') || 
                                   img.closest('.beta-img') || 
                                   img.closest('[class*="beta-img"]');
      
      if (routeOverlayContainer && !processedRouteOverlays.has(routeOverlayContainer as HTMLElement)) {
        // This is a RouteOverlay - find all images in the container
        const allImages = routeOverlayContainer.querySelectorAll('img');
        
        if (allImages.length >= 1) {
          const baseImg = allImages[0] as HTMLImageElement; // First image is the base
          const overlayImg = allImages.length > 1 ? allImages[1] as HTMLImageElement : null; // Second image is the overlay
          
          processedRouteOverlays.add(routeOverlayContainer as HTMLElement);
          
          imageData.push({
            src: baseImg.src,
            alt: baseImg.alt || 'Route image with climbing route overlay',
            element: baseImg,
            type: 'route-overlay',
            overlaySrc: overlayImg?.src
          });
          
          return; // Skip individual processing for RouteOverlay images
        }
      }

      // Skip if this image is part of a RouteOverlay that we've already processed
      if (routeOverlayContainer && processedRouteOverlays.has(routeOverlayContainer as HTMLElement)) {
        return;
      }

      // Regular image
      imageData.push({
        src: img.src,
        alt: img.alt || '',
        element: img,
        type: 'normal'
      });
    });

    setImages(imageData);
    return imageData;
  }, []);

  const addClickHandlers = useCallback((imageData: ImageData[]) => {
    imageData.forEach((image, index) => {
      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(index);
        setIsGalleryOpen(true);
      };

      // Remove existing listener if any
      image.element.removeEventListener('click', handleClick);
      // Add new listener
      image.element.addEventListener('click', handleClick);
      // Make cursor pointer to indicate clickability
      image.element.style.cursor = 'pointer';
    });
  }, []);

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const initializeGallery = useCallback(() => {
    // Wait for images to load
    setTimeout(() => {
      const imageData = detectImages();
      addClickHandlers(imageData);
    }, 100);
  }, [detectImages, addClickHandlers]);

  useEffect(() => {
    // Initialize when component mounts
    initializeGallery();

    // Re-initialize when page content changes (for SPA navigation)
    const observer = new MutationObserver(() => {
      initializeGallery();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      // Clean up event listeners
      images.forEach(image => {
        image.element.style.cursor = '';
        // Note: We can't easily remove the specific event listener here
        // but it will be garbage collected when the element is removed
      });
    };
  }, [initializeGallery]);

  return {
    images,
    isGalleryOpen,
    currentImageIndex,
    closeGallery,
    initializeGallery
  };
};