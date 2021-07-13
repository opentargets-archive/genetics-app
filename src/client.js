import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import config from './config';

const client = new ApolloClient({
  link: new HttpLink({
    uri: config.apiUrl,
  }),
  cache: new InMemoryCache(),
});

export default client;
