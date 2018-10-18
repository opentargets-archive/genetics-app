const rewireInlineImportGraphqlAst = require('react-app-rewire-inline-import-graphql-ast');
const rewireGraphqlTag = require('react-app-rewire-graphql-tag');

module.exports = function override(config, env) {
  // needed to parse graphql files
  config = rewireInlineImportGraphqlAst(config, env);
  config = rewireGraphqlTag(config, env);
  return config;
};
