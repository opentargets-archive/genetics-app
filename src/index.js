import 'core-js/fn/array/find';
import 'core-js/fn/math/log10';

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

import App from './App';
import { unregister } from './registerServiceWorker';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://genetics-api.opentargets.io/graphql',
  }),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// disable service worker
unregister();
