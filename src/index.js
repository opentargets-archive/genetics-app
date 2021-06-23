import 'core-js/fn/array/find';
import 'core-js/fn/math/log10';
import 'core-js/fn/object/values';

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import TagManager from 'react-gtm-module';

import App from './App';
import { unregister } from './registerServiceWorker';
import config from './config';

const client = new ApolloClient({
  link: new HttpLink({
    uri: config.apiUrl,
  }),
  cache: new InMemoryCache(),
});

if (config.googleTagManagerID) {
  TagManager.initialize({ gtmId: config.googleTagManagerID });
}

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// disable service worker
unregister();
