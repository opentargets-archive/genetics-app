import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import logo from './logo.svg';
import './App.css';
import { TestComponent } from 'ot-ui';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <TestComponent name='World' />

        <Query
                query={gql`
                  {
                    pheWAS(variantId: "1_1002003_A_G") {
                      associations {
                        studyId
                        pmId
                        traitReported
                        n
                        nCases
                        eaf
                        beta
                        se
                        pval
                      }
                    }
                  }
                `}
            >
                {({ loading, error, data }) => {
                  console.log('data', data)
                  return null
                }}
        </Query>

        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
