import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import casual from 'casual-browserify';

import App from './App';
import { unregister } from './registerServiceWorker';

// START: WITH_PARTIAL_MOCKING
import getMockSchemaLink from './graphql-mocking/mockSchemaLink';

getMockSchemaLink().then(mockSchemaLink => {
  const client = new ApolloClient({
    link: mockSchemaLink,
    cache: new InMemoryCache({
      dataIdFromObject: object => {
        switch (object.__typename) {
          case 'QTLElement':
          case 'IntervalElement':
          case 'FunctionalPredictionElement':
            return casual.uuid;
          default:
            return defaultDataIdFromObject(object);
        }
      },
    }),
  });

  ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('root')
  );

  // disable service worker
  unregister();
});
// END: WITH_PARTIAL_MOCKING

// // START: WITH_LIVE_ONLY
// import { HttpLink } from 'apollo-link-http';
// const client = new ApolloClient({
//   link: new HttpLink({
//     uri: 'https://open-targets-genetics.appspot.com/graphql',
//   }),
//   cache: new InMemoryCache(),
// });

// ReactDOM.render(
//   <ApolloProvider client={client}>
//     <App />
//   </ApolloProvider>,
//   document.getElementById('root')
// );

// // disable service worker
// unregister();
// // END: WITH_LIVE_ONLY
