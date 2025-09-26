import React from 'react';
import { createRoot } from 'react-dom/client';
import DemoApp from './DemoApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DemoApp />);
} else {
  console.error('Root container not found');
}