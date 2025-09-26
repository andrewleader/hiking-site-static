import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import type {
  BetaCreatorInstance,
  BetaCreatorOptions,
  BetaCreatorReadyCallback,
  BetaCreatorData
} from '../types/betacreator';

// Import styles
import '../styles/betacreator.css';
import '../styles/betacreator-react.css';

export interface BetaCreatorProps {
  /** Image source URL or HTMLImageElement for the base climbing photo */
  src: string | HTMLImageElement;
  
  /** Width of the editor (number for pixels, string for CSS units) */
  width?: number | string;
  
  /** Height of the editor (number for pixels, string for CSS units) */
  height?: number | string;
  
  /** How the image should be scaled to fit the container */
  zoom?: 'contain' | 'cover' | 'fill' | number;
  
  /** Scale factor for all drawing elements */
  scaleFactor?: number;
  
  /** Initial route data to load */
  initialData?: string | BetaCreatorData;
  
  /** Callback fired when the editor is ready */
  onReady?: () => void;
  
  /** Callback fired when the route data changes */
  onChange?: () => void;
  
  /** Callback fired when an error occurs */
  onError?: (error: string) => void;
  
  /** CSS class name for the container */
  className?: string;
  
  /** Additional CSS styles for the container */
  style?: React.CSSProperties;
}

export interface BetaCreatorRef {
  /** Get the current route data as JSON string */
  getData: (escape?: boolean) => string;
  
  /** Load route data from JSON string */
  loadData: (data: string | BetaCreatorData) => void;
  
  /** Export the current route as an image */
  getImage: (includeSource?: boolean, type?: string, width?: number) => string;
  
  /** Get the underlying BetaCreator instance */
  getInstance: () => BetaCreatorInstance | null;
}

const BetaCreator = forwardRef<BetaCreatorRef, BetaCreatorProps>(
  (
    {
      src,
      width,
      height,
      zoom = 'contain',
      scaleFactor = 1,
      initialData,
      onReady,
      onChange,
      onError,
      className,
      style
    },
    ref
  ) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const instanceRef = useRef<BetaCreatorInstance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      getData: (escape?: boolean) => {
        if (!instanceRef.current) {
          throw new Error('BetaCreator not initialized');
        }
        return instanceRef.current.getData(escape);
      },
      
      loadData: (data: string | BetaCreatorData) => {
        if (!instanceRef.current) {
          throw new Error('BetaCreator not initialized');
        }
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        instanceRef.current.loadData(dataString);
      },
      
      getImage: (includeSource?: boolean, type?: string, width?: number) => {
        if (!instanceRef.current) {
          throw new Error('BetaCreator not initialized');
        }
        return instanceRef.current.getImage(includeSource, type, width);
      },
      
      getInstance: () => instanceRef.current
    }));

    // Initialize BetaCreator
    useEffect(() => {
      const initializeBetaCreator = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // Ensure the BetaCreator library is loaded
          if (!window.BetaCreator) {
            // Load the library dynamically
            await loadBetaCreatorLibrary();
          }

          if (!imageRef.current) {
            return;
          }

          const options: BetaCreatorOptions = {
            width,
            height,
            zoom,
            scaleFactor,
            onChange,
            onError: (err: string) => {
              setError(err);
              onError?.(err);
            }
          };

          const readyCallback: BetaCreatorReadyCallback = function() {
            instanceRef.current = this;
            
            // Load initial data if provided
            if (initialData) {
              try {
                const dataString = typeof initialData === 'string' 
                  ? initialData 
                  : JSON.stringify(initialData);
                this.loadData(dataString);
              } catch (err) {
                const errorMsg = `Failed to load initial data: ${err}`;
                setError(errorMsg);
                onError?.(errorMsg);
              }
            }
            
            setIsLoading(false);
            onReady?.();
          };

          // Create the BetaCreator instance
          window.BetaCreator(imageRef.current, readyCallback, options);

        } catch (err) {
          const errorMsg = `Failed to initialize BetaCreator: ${err}`;
          setError(errorMsg);
          onError?.(errorMsg);
          setIsLoading(false);
        }
      };

      initializeBetaCreator();

      // Cleanup
      return () => {
        // BetaCreator will have replaced/modified the image element
        // Reset it back to original state if needed
        instanceRef.current = null;
      };
    }, [src, width, height, zoom, scaleFactor, initialData, onReady, onChange, onError]);

    // Handle image source changes
    useEffect(() => {
      if (imageRef.current) {
        if (typeof src === 'string') {
          imageRef.current.src = src;
        } else {
          imageRef.current.src = src.src;
        }
      }
    }, [src]);

    return (
      <div 
        className={`betacreator-wrapper ${className || ''}`}
        style={style}
      >
        {/* Image element that BetaCreator will transform */}
        <img 
          ref={imageRef}
          src={typeof src === 'string' ? src : src.src}
          style={{ 
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            maxWidth: '100%',
            display: 'block'
          }}
          alt="Route reference"
        />
        
        {/* Loading state */}
        {isLoading && (
          <div className="betacreator-loading" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.8)',
            padding: '10px',
            borderRadius: '4px'
          }}>
            Loading BetaCreator...
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="betacreator-error" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,0,0,0.1)',
            border: '1px solid red',
            padding: '10px',
            borderRadius: '4px',
            color: 'red'
          }}>
            Error: {error}
          </div>
        )}
      </div>
    );
  }
);

BetaCreator.displayName = 'BetaCreator';

export default BetaCreator;

// Library loading function
async function loadBetaCreatorLibrary(): Promise<void> {
  // Check if already loaded
  if (typeof window.BetaCreator === 'function') {
    return Promise.resolve();
  }
  
  try {
    // Import the bundled library
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Dynamic import of JavaScript bundle
    await import('../lib/betacreator-bundled.js');
    
    // Verify it loaded correctly
    if (typeof window.BetaCreator !== 'function') {
      throw new Error('BetaCreator global not found after loading library');
    }
    
    return Promise.resolve();
  } catch (error) {
    throw new Error(`Failed to load BetaCreator library: ${error}`);
  }
}