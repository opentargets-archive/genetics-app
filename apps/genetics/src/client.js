import config from './config';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: config.apiUrl,
  cache: new InMemoryCache(),
});

export default client;

// const all = { client, clientsss };
