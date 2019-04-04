import 'core-js/fn/array/find';
import 'core-js/fn/math/log10';
import 'core-js/fn/object/values';

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

import App from './App';
import { unregister } from './registerServiceWorker';

// set up the api from environment variable (with production as default)
const apiUrlDefault = 'https://genetics-api.opentargets.io';
const apiUrl = process.env.REACT_APP_GRAPHQL_API_URL
  ? process.env.REACT_APP_GRAPHQL_API_URL
  : apiUrlDefault;

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${apiUrl}/graphql`,
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
