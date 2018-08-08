import React from 'react';

import { Page, NavBar, Footer } from 'ot-ui';

const BasePage = ({ children }) => (
  <Page
    header={<NavBar name="Genetics" />}
    footer={<Footer style={{ bottom: 0 }} />}
  >
    {children}
  </Page>
);

export default BasePage;
