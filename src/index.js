import React from 'react';
import ReactDOM from 'react-dom';
import TagManager from 'react-gtm-module';

import App from './App';
import config from './config';
import { unregister } from './registerServiceWorker';

if (config.googleTagManagerID) {
  TagManager.initialize({ gtmId: config.googleTagManagerID });
}

ReactDOM.render(<App />, document.getElementById('root'));

// disable service worker
unregister();
