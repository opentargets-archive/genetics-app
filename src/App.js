import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { OtUiThemeProvider } from 'ot-ui';

import './App.css';

import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import GenePage from './pages/GenePage';
import VariantPage from './pages/VariantPage';
import LocusPage from './pages/LocusPage';
import RegionalPage from './pages/RegionalPage';

const App = () => (
    <OtUiThemeProvider>
        <Router>
            <React.Fragment>
                <Route exact path="/" component={HomePage} />
                <Route path="/study/:studyId" component={StudyPage} />
                <Route path="/gene/:geneId" component={GenePage} />
                <Route path="/variant/:variantId" component={VariantPage} />
                <Route path="/locus" component={LocusPage} />
                <Route
                    path="/regional/:studyId/:variantId"
                    component={RegionalPage}
                />
            </React.Fragment>
        </Router>
    </OtUiThemeProvider>
);

export default App;
