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
import { graphqlApiUrl } from './configuration';

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${graphqlApiUrl}/graphql`,
  }),
  cache: new InMemoryCache(),
});

fetch('/config.json')
  .then(response => {
    if (!response.ok) {
      throw Error('Got ' + response.status + ' http status');
    }
    return response.json();
  })
  .catch(err => {
    console.log(
      "Use default application configuration as config.json hasn't been found or parsed:",
      err
    );
    return {};
  })
  .then(config =>
    ReactDOM.render(
      <ApolloProvider client={client}>
        <App {...config} />
      </ApolloProvider>,
      document.getElementById('root')
    )
  );

// disable service worker
unregister();
