import React, { useState, useRef, useCallback } from 'react';
import { Field, wrapFieldsWithMeta } from 'tinacms';
import BetaCreator, { type BetaCreatorRef } from '../../components/BetaCreator';

// CSS for the modal
const modalStyles = `
  .route-overlay-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .route-overlay-modal-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    max-width: 95vw;
    max-height: 95vh;
    overflow: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  
  .route-overlay-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }
  
  .route-overlay-button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 14px;
  }
  
  .route-overlay-button:hover {
    background: #f5f5f5;
  }
  
  .route-overlay-button.primary {
    background: #0084ff;
    color: white;
    border-color: #0084ff;
  }
  
  .route-overlay-button.primary:hover {
    background: #0066cc;
  }
  
  .route-overlay-input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-width: 200px;
  }
  
  .route-overlay-preview {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    background: #f9f9f9;
    cursor: pointer;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .route-overlay-preview:hover {
    background: #f0f0f0;
  }
`;

interface RouteOverlayEditorProps {
  field: any;
  input: {
    onChange: (value: any) => void;
    value: {
      imageSrc?: string;
      topoData?: string;
      topoOverlaySrc?: string;
    };
  };
  meta: {
    error?: string;
  };
}

const RouteOverlayEditor: React.FC<RouteOverlayEditorProps> = ({ field, input, meta }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(input.value?.imageSrc || '');
  const [currentData, setCurrentData] = useState(input.value?.topoData || '{}');
  const betaCreatorRef = useRef<BetaCreatorRef>(null);

  // Add styles to document head
  React.useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = modalStyles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handleSave = useCallback(() => {
    if (betaCreatorRef.current && imageUrl) {
      try {
        const topoData = betaCreatorRef.current.getData();
        const overlayImage = betaCreatorRef.current.getImage(false, 'png');
        
        const newValue = {
          imageSrc: imageUrl,
          topoData: topoData,
          topoOverlaySrc: overlayImage
        };
        
        input.onChange(newValue);
        setCurrentData(topoData);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to save route overlay:', error);
        alert('Failed to save route overlay. Please try again.');
      }
    }
  }, [imageUrl, input]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    setImageUrl(input.value?.imageSrc || '');
  }, [input.value?.imageSrc]);

  const handleLoadNewImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      setImageUrl(url);
    }
  }, []);

  const openEditor = useCallback(() => {
    setImageUrl(input.value?.imageSrc || '');
    setIsModalOpen(true);
  }, [input.value?.imageSrc]);

  const hasData = input.value?.imageSrc && input.value?.topoData;

  return (
    <div>
      {/* Preview/Edit Button */}
      <div className="route-overlay-preview" onClick={openEditor}>
        {hasData ? (
          <div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Route Overlay Created</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Image: {input.value.imageSrc}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Click to edit route overlay
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '8px', color: '#999' }}>
              📍 No Route Overlay
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Click to create route overlay
            </div>
          </div>
        )}
      </div>

      {meta.error && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          {meta.error}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="route-overlay-modal">
          <div className="route-overlay-modal-content">
            <h2 style={{ margin: '0 0 20px 0' }}>Edit Route Overlay</h2>
            
            {/* Controls */}
            <div className="route-overlay-controls">
              <input
                type="text"
                className="route-overlay-input"
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button
                className="route-overlay-button"
                onClick={handleLoadNewImage}
              >
                📁 Choose Image
              </button>
              <div style={{ flex: 1 }} />
              <button
                className="route-overlay-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="route-overlay-button primary"
                onClick={handleSave}
                disabled={!imageUrl}
              >
                Save Route
              </button>
            </div>

            {/* BetaCreator Editor */}
            {imageUrl && (
              <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                <BetaCreator
                  ref={betaCreatorRef}
                  src={imageUrl}
                  width={800}
                  height={600}
                  initialData={currentData}
                  onReady={() => console.log('BetaCreator ready')}
                  onChange={() => console.log('Route changed')}
                  onError={(error: any) => console.error('BetaCreator error:', error)}
                />
              </div>
            )}

            {!imageUrl && (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#666',
                border: '2px dashed #ddd',
                borderRadius: '4px'
              }}>
                Enter an image URL above to start creating a route overlay
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteOverlayEditor;