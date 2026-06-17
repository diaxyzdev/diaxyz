import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import Button from '../includes/components/Button.jsx';

const initialData = window.__INITIAL_DATA__ || { pageUrl: '/' };

// Hydrate the pre-rendered button on the client side using same data
hydrateRoot(
  document.getElementById('root'),
  React.createElement(Button, null, `Click me! (Page: ${initialData.pageUrl})`)
);
