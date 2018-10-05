import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { OtUiThemeProvider } from 'ot-ui';

import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import StudiesPage from './pages/StudiesPage';
import GenePage from './pages/GenePage';
import VariantPage from './pages/VariantPage';
import LocusPage from './pages/LocusPage';
import RegionalPage from './pages/RegionalPage';
import withPageAnalytics from './analytics/withPageAnalytics';

const App = () => (
  <OtUiThemeProvider>
    <Router>
      <React.Fragment>
        <Route exact path="/" component={withPageAnalytics(HomePage)} />
        <Route
          path="/study/:studyId"
          component={withPageAnalytics(StudyPage)}
        />
        <Route
          path="/study-comparison/:studyId"
          component={withPageAnalytics(StudiesPage)}
        />
        <Route path="/gene/:geneId" component={withPageAnalytics(GenePage)} />
        <Route
          path="/variant/:variantId"
          component={withPageAnalytics(VariantPage)}
        />
        <Route path="/locus" component={withPageAnalytics(LocusPage)} />
        <Route
          path="/regional/:studyId/:variantId"
          component={withPageAnalytics(RegionalPage)}
        />
      </React.Fragment>
    </Router>
  </OtUiThemeProvider>
);

export default App;
