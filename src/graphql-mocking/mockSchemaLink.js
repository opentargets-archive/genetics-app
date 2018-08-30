import {
  mergeSchemas,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  introspectSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';
import { SchemaLink } from 'apollo-link-schema';
import { HttpLink } from 'apollo-link-http';

import mocks from './mocks';
import { typeDefs, typeResolvers } from './schema.js';

// see https://github.com/hasura/client-side-graphql
// see https://github.com/apollographql/graphql-tools/pull/382
const getRemoteExecutableSchema = async uri => {
  const httpLink = new HttpLink({ uri });
  const remoteSchema = await introspectSchema(httpLink);
  return makeRemoteExecutableSchema({ schema: remoteSchema, link: httpLink });
};

const getMergedSchemaLink = async () => {
  // --- MOCK SCHEMA ---
  // construct schema and attach type resolvers (if any)
  const mockSchema = makeExecutableSchema({
    typeDefs,
    resolvers: typeResolvers,
  });

  // attach mock resolvers
  addMockFunctionsToSchema({
    schema: mockSchema,
    mocks,
  });

  // --- LIVE SCHEMA ---
  const liveUrl = 'https://open-targets-genetics.appspot.com/graphql';
  const liveSchema = await getRemoteExecutableSchema(liveUrl);

  // --- MERGED SCHEMA ---
  const mergedSchema = mergeSchemas({
    schemas: [mockSchema, liveSchema],
  });
  const mergedSchemaLink = new SchemaLink({ schema: mergedSchema });
  return mergedSchemaLink;
};

export default getMergedSchemaLink;
