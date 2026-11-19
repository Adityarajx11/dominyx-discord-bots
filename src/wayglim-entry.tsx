import React from 'react';
import { createRoot } from 'react-dom/client';
import WayglimBackground from './components/WayglimBackground';

const mount = document.getElementById('wayglim-root');

if (mount) {
  createRoot(mount).render(React.createElement(WayglimBackground, { label: 'Animated Aurex background' }));
}
