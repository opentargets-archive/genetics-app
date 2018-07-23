import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { SchemaLink } from 'apollo-link-schema';

import mocks from './mocks';
import { typeDefs } from './schema.js';

// construct schema
const schema = makeExecutableSchema({ typeDefs });

// attach mock resolvers
addMockFunctionsToSchema({ schema, mocks });

// construct link for client
const mockSchemaLink = new SchemaLink({ schema });

export default mockSchemaLink;
