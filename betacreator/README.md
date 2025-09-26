# BetaCreator React TypeScript Component

A React TypeScript wrapper for the BetaCreator rock climbing route guide library. This component allows you to easily integrate climbing route drawing capabilities into modern React applications while preserving all the functionality of the original BetaCreator library.

## Features

- 🧗 Complete climbing route drawing tools (lines, stamps, text)
- 🎨 Color picker and customizable styles  
- 📱 Responsive design with configurable sizing
- 💾 Save/load route data as JSON
- 🖼️ Export routes as high-quality images
- 🔒 Type-safe TypeScript API
- ⚛️ Fully React-compatible with hooks and refs

## Installation

```bash
npm install betacreator-react
# or
yarn add betacreator-react
```

## Quick Start

```tsx
import React, { useRef } from 'react';
import BetaCreator, { BetaCreatorRef } from 'betacreator-react';

function MyClimbingApp() {
  const betaCreatorRef = useRef<BetaCreatorRef>(null);

  const handleSave = () => {
    const data = betaCreatorRef.current?.getData();
    console.log('Route data:', data);
  };

  return (
    <div>
      <BetaCreator
        ref={betaCreatorRef}
        src="https://example.com/climbing-photo.jpg"
        width={800}
        height={600}
        onReady={() => console.log('Ready to draw!')}
        onChange={() => console.log('Route changed')}
      />
      <button onClick={handleSave}>Save Route</button>
    </div>
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| HTMLImageElement` | required | Source image URL or element |
| `width` | `number \| string` | auto | Editor width |
| `height` | `number \| string` | auto | Editor height |
| `zoom` | `'contain' \| 'cover' \| 'fill' \| number` | `'contain'` | Image scaling mode |
| `scaleFactor` | `number` | `1` | Scale factor for drawing elements |
| `initialData` | `string \| BetaCreatorData` | - | Initial route data to load |
| `onReady` | `() => void` | - | Called when editor is ready |
| `onChange` | `() => void` | - | Called when route changes |
| `onError` | `(error: string) => void` | - | Called on errors |
| `className` | `string` | - | CSS class name |
| `style` | `React.CSSProperties` | - | Inline styles |

### Ref Methods

```tsx
const ref = useRef<BetaCreatorRef>(null);

// Get route data as JSON string
const data = ref.current?.getData();

// Load route data
ref.current?.loadData(jsonString);

// Export as image (data URL)
const imageUrl = ref.current?.getImage(includeSource, format, width);

// Get underlying BetaCreator instance
const instance = ref.current?.getInstance();
```

## Examples

### Basic Usage

```tsx
import BetaCreator from 'betacreator-react';

<BetaCreator
  src="path/to/climbing-photo.jpg"
  width={800}
  height={600}
/>
```

### With Save/Load

```tsx
function RouteEditor() {
  const ref = useRef<BetaCreatorRef>(null);
  const [savedData, setSavedData] = useState<string>('');

  const save = () => {
    const data = ref.current?.getData();
    if (data) {
      setSavedData(data);
      localStorage.setItem('route', data);
    }
  };

  const load = () => {
    const data = localStorage.getItem('route');
    if (data) {
      ref.current?.loadData(data);
    }
  };

  return (
    <div>
      <BetaCreator ref={ref} src="photo.jpg" />
      <button onClick={save}>Save</button>
      <button onClick={load}>Load</button>
    </div>
  );
}
```

### Export Image

```tsx
function ExportableEditor() {
  const ref = useRef<BetaCreatorRef>(null);

  const exportImage = () => {
    const imageDataUrl = ref.current?.getImage(
      true,  // include source image
      'png', // format
      1200   // width
    );
    
    if (imageDataUrl) {
      const link = document.createElement('a');
      link.download = 'climbing-route.png';
      link.href = imageDataUrl;
      link.click();
    }
  };

  return (
    <div>
      <BetaCreator ref={ref} src="photo.jpg" />
      <button onClick={exportImage}>Download Route</button>
    </div>
  );
}
```

## Data Format

Route data is stored as JSON with this structure:

```typescript
interface BetaCreatorData {
  items: BetaCreatorItemData[];
}

interface BetaCreatorItemData {
  it: 'line' | 'text' | 'anchor' | 'belay' | 'piton' | 'rappel';
  ic: string; // color
  x: number;  // x position
  y: number;  // y position
  // ... other properties depending on item type
}
```

## Development

This project wraps the original BetaCreator library, maintaining full compatibility while providing a modern React interface. The original JavaScript library is bundled and loaded automatically.

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-repo/betacreator-react-ts.git
cd betacreator-react-ts

# Install dependencies
npm install

# Bundle the original library
npm run bundle:betacreator

# Start development server
npm run dev

# Build library
npm run build:lib
```

## License

This project maintains the same Apache 2.0 license as the original BetaCreator library.

## Credits

- Original BetaCreator library by Alma Madsen
- React wrapper implementation

## Contributing

Contributions welcome! Please read the contributing guidelines and submit pull requests for any improvements.

## Support

- 🐛 Report bugs on GitHub Issues
- 💡 Feature requests welcome
- 📚 Check the documentation for detailed examples
- 💬 Community support available

---

Made with ❤️ for the climbing community