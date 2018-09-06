import React from 'react';
import { Helmet } from 'react-helmet';
import { Page, NavBar, Footer } from 'ot-ui';

import pkg from '../../package.json';
import Search from '../components/Search';

const BasePage = ({ children }) => (
  <Page
    header={<NavBar name="Genetics" search={<Search />} />}
    footer={
      <Footer
        style={{ bottom: 0 }}
        version={pkg.version}
        commitHash={
          process.env.REACT_APP_REVISION
            ? process.env.REACT_APP_REVISION
            : '2222ccc'
        }
        githubUrl="https://github.com/opentargets/genetics-app"
      />
    }
  >
    <Helmet
      defaultTitle="Open Targets Genetics"
      titleTemplate="%s | Open Targets Genetics"
    />
    {children}
  </Page>
);

export default BasePage;
