import gql from 'graphql-tag';

// Note: Using .js instead of .gql file for schema, since
//       .gql files seem to not refresh due to babel-loader's
//       cacheDirectory=true. Can't disable without `yarn eject`.

export const typeDefs = gql`
# ----------------------------------------------------

type Query {
    hello: Hello
}
type Hello {
    label: String
}

# ----------------------------------------------------
`;
