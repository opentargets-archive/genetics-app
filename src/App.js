import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { ApolloProvider as ApolloProviderR } from 'react-apollo';
import { ApolloProvider } from '@apollo/client';
import { OtUiThemeProvider } from 'ot-ui';

import { client, clientsss } from './client';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import StudiesPage from './pages/StudiesPage';
import GenePage from './pages/GenePage';
import VariantPage from './pages/VariantPage';
import LocusPage from './pages/LocusPage';
import StudyLocusPage from './pages/StudyLocusPage';
import ImmunobasePage from './pages/ImmunobasePage';

const App = () => (
  <ApolloProvider client={client}>
    <ApolloProviderR client={clientsss}>
      <OtUiThemeProvider>
        <Router>
          <React.Fragment>
            <Route exact path="/" component={HomePage} />
            <Route path="/study/:studyId" component={StudyPage} />
            <Route path="/study-comparison/:studyId" component={StudiesPage} />
            <Route path="/gene/:geneId" component={GenePage} />
            <Route path="/variant/:variantId" component={VariantPage} />
            <Route path="/locus" component={LocusPage} />
            <Route
              path="/study-locus/:studyId/:indexVariantId"
              component={StudyLocusPage}
            />
            <Route path="/immunobase" component={ImmunobasePage} />
          </React.Fragment>
        </Router>
      </OtUiThemeProvider>
    </ApolloProviderR>
  </ApolloProvider>
);

export default App;
