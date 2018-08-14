import React from 'react';
import pkg from '../../package.json';

import { Page, NavBar, Footer } from 'ot-ui';

const BasePage = ({ children }) => (
  <Page
    header={<NavBar name="Genetics" />}
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
    {children}
  </Page>
);

export default BasePage;
