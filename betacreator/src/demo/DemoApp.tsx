import React, { useRef, useState } from 'react';
import BetaCreator from '../components/BetaCreator';
import type { BetaCreatorRef } from '../components/BetaCreator';

const DemoApp: React.FC = () => {
  const betaCreatorRef = useRef<BetaCreatorRef>(null);
  const [savedData, setSavedData] = useState<string>('');
  const [isReady, setIsReady] = useState(true);
  const [imageSize, setImageSize] = useState(600);
  const [includeSrc, setIncludeSrc] = useState(false);

  // Sample climbing photo (you can replace with any climbing route photo)
  const sampleImageUrl = 'https://andrewbares.blob.core.windows.net/hiking-blog-images/2024/06/415915208_765410188960258_6663712304325429249_n.FfqOYbP2-683x1024.jpg';

  const handleReady = () => {
    console.log('BetaCreator is ready!');
    setIsReady(true);
  };

  const handleChange = () => {
    console.log('Route data changed');
  };

  const handleError = (error: string) => {
    console.error('BetaCreator error:', error);
    alert(`Error: ${error}`);
  };

  const saveData = () => {
    if (!betaCreatorRef.current) {
      alert('BetaCreator not ready');
      return;
    }

    try {
      const data = betaCreatorRef.current.getData();
      setSavedData(data);
      
      // Also save to localStorage for persistence
      if (window.localStorage) {
        localStorage.setItem('bcData', data);
      }
      
      alert('Route data saved successfully!');
      console.log('Saved data:', data);
    } catch (error) {
      alert(`Failed to save: ${error}`);
    }
  };

  const loadData = () => {
    if (!betaCreatorRef.current) {
      alert('BetaCreator not ready');
      return;
    }

    try {
      let dataToLoad = savedData;
      
      // If no saved data, try localStorage
      if (!dataToLoad && window.localStorage) {
        dataToLoad = localStorage.getItem('bcData') || '';
      }

      if (!dataToLoad) {
        alert('No saved data found. Save some route data first.');
        return;
      }

      betaCreatorRef.current.loadData(dataToLoad);
      alert('Route data loaded successfully!');
    } catch (error) {
      alert(`Failed to load: ${error}`);
    }
  };

  const exportImage = () => {
    if (!betaCreatorRef.current) {
      alert('BetaCreator not ready');
      return;
    }

    try {
      const imageDataUrl = betaCreatorRef.current.getImage(
        includeSrc, 
        'png', 
        imageSize > 0 ? imageSize : undefined
      );
      
      // Create a download link
      const link = document.createElement('a');
      link.download = 'climbing-route.png';
      link.href = imageDataUrl;
      link.click();
    } catch (error) {
      alert(`Failed to export image: ${error}`);
    }
  };

  const clearData = () => {
    if (!betaCreatorRef.current) {
      alert('BetaCreator not ready');
      return;
    }

    try {
      // Load empty data to clear everything
      betaCreatorRef.current.loadData('{"items":[]}');
      setSavedData('');
      
      if (window.localStorage) {
        localStorage.removeItem('bcData');
      }
      
      alert('Route cleared successfully!');
    } catch (error) {
      alert(`Failed to clear: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>BetaCreator React Demo</h1>
      <p>
        This demo shows how to use the BetaCreator React component to create 
        climbing route guides. Draw on the image to create your route!
      </p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Controls:</h3>
        <button onClick={saveData} disabled={!isReady} style={buttonStyle}>
          Save Route Data
        </button>
        <button onClick={loadData} disabled={!isReady} style={buttonStyle}>
          Load Route Data
        </button>
        <button onClick={clearData} disabled={!isReady} style={buttonStyle}>
          Clear Route
        </button>
        <button onClick={exportImage} disabled={!isReady} style={buttonStyle}>
          Export Image
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Export Settings:</h3>
        <label style={{ marginRight: '20px' }}>
          Image Size: 
          <input 
            type="number" 
            value={imageSize} 
            onChange={(e) => setImageSize(parseInt(e.target.value) || 600)}
            style={{ marginLeft: '5px', width: '80px' }}
          />
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={includeSrc} 
            onChange={(e) => setIncludeSrc(e.target.checked)}
          />
          Include source image
        </label>
      </div>

      <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
        <BetaCreator
          ref={betaCreatorRef}
          src={sampleImageUrl}
          width={800}
          height={600}
          zoom="contain"
          onReady={handleReady}
          onChange={handleChange}
          onError={handleError}
          style={{ display: 'block' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Status:</h3>
        <p>Ready: {isReady ? 'Yes' : 'No'}</p>
        <p>Saved Data: {savedData ? 'Yes' : 'No'}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Instructions:</h3>
        <ul>
          <li>Use the toolbar at the top to select tools (select, line, stamps, text)</li>
          <li>Click and drag to draw lines showing the climbing route</li>
          <li>Use stamps to mark anchors, belays, pitons, and rappel points</li>
          <li>Add text labels to describe moves or features</li>
          <li>Use the color picker to change colors</li>
          <li>Save your work and export as an image to share</li>
        </ul>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  margin: '0 10px 10px 0',
  padding: '8px 16px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

export default DemoApp;