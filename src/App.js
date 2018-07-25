import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import logo from './logo.svg';
import './App.css';
import { TestComponent } from 'ot-ui';

import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import GenePage from './pages/GenePage';
import VariantPage from './pages/VariantPage';
import LocusPage from './pages/LocusPage';
import RegionalPage from './pages/RegionalPage';

const App = () => (
    <Router>
        <React.Fragment>
            <Route exact path="/" component={HomePage} />
            <Route path="/study/:studyId" component={StudyPage} />
            <Route path="/gene/:geneId" component={GenePage} />
            <Route path="/variant/:variantId" component={VariantPage} />
            <Route path="/locus" component={LocusPage} />
            <Route path="/regional/:studyId/:variantId" component={RegionalPage} />
        </React.Fragment>
    </Router>
)

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h1 className="App-title">Welcome to React</h1>
//         </header>
//         <TestComponent name='World' />

//         <Query
//                 query={gql`
//                   {
//                     pheWAS(variantId: "1_1002003_A_G") {
//                       associations {
//                         studyId
//                         pmId
//                         traitReported
//                         n
//                         nCases
//                         eaf
//                         beta
//                         se
//                         pval
//                       }
//                     }
//                   }
//                 `}
//             >
//                 {({ loading, error, data }) => {
//                   console.log('data', data)
//                   return null
//                 }}
//         </Query>

//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }

export default App;
