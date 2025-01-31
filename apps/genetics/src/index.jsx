import * as ReactDOMClient from 'react-dom/client';
import TagManager from 'react-gtm-module';

import '@fontsource/inter';
import './index.css';

import App from './App';
import config from './config';
import { unregister } from './registerServiceWorker';

if (config.googleTagManagerID) {
  TagManager.initialize({ gtmId: config.googleTagManagerID });
}

const root = ReactDOMClient.createRoot(document.getElementById('root'));

root.render(<App />);

// disable service worker
unregister();
