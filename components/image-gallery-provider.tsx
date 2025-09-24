'use client';

import React from 'react';
import { ImageGallery } from './image-gallery';
import { useImageGallery } from '@/hooks/useImageGallery';

export const ImageGalleryProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const {
    images,
    isGalleryOpen,
    currentImageIndex,
    closeGallery
  } = useImageGallery();

  return (
    <>
      {children}
      <ImageGallery
        images={images}
        initialIndex={currentImageIndex}
        isOpen={isGalleryOpen}
        onClose={closeGallery}
      />
    </>
  );
};