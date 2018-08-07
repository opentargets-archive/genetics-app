const rewireInlineImportGraphqlAst = require('react-app-rewire-inline-import-graphql-ast');

module.exports = function override(config, env) {
  // needed to parse graphql files
  config = rewireInlineImportGraphqlAst(config, env);
  return config;
};
