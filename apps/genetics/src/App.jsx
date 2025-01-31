import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, SearchProvider } from 'ui';
import SEARCH_QUERY from './components/Search/SearchQuery.gql';

import client from './client';
import HomePage from './pages/HomePage/index';
import StudyPage from './pages/StudyPage';
import StudiesPage from './pages/StudiesPage';
import GenePage from './pages/GenePage';
import VariantPage from './pages/VariantPage';
import LocusPage from './pages/LocusPage';
import StudyLocusPage from './pages/StudyLocusPage';
import ImmunobasePage from './pages/ImmunobasePage';
import NotFoundPage from './pages/NotFoundPage';
import APIPage from './pages/APIPage';

const App = () => (
  <ApolloProvider client={client}>
    <ThemeProvider>
      <SearchProvider searchQuery={SEARCH_QUERY} searchPlaceholder="Search for a gene, variant, study, or trait...">
        <Router>
          <Switch>
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
            <Route path="/api" component={APIPage} />
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </Router>
      </SearchProvider>
    </ThemeProvider>
  </ApolloProvider>
);

export default App;
