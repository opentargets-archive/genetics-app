import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';

import './index.css';
import App from './App';
import { unregister } from './registerServiceWorker';

// Note: mock schema used for development purposes,
//       this will be replaced before launch
import mockSchemaLink from './graphql-mocking/mockSchemaLink';

const client = new ApolloClient({
  // uri: 'https://<API>/graphql', // TODO: connect to Miguel's API
  link: mockSchemaLink,
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
