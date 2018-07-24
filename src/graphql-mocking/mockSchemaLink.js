import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { SchemaLink } from 'apollo-link-schema';

import mocks from './mocks';
import { typeDefs, typeResolvers } from './schema.js';

// construct schema and attach type resolvers (if any)
const schema = makeExecutableSchema({ typeDefs, resolvers: typeResolvers });

// attach mock resolvers
addMockFunctionsToSchema({ schema, mocks });

// construct link for client
const mockSchemaLink = new SchemaLink({ schema });

export default mockSchemaLink;
