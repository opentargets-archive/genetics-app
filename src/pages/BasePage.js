import React from 'react';
import { Helmet } from 'react-helmet';
import { Link as RouterLink } from 'react-router-dom';

import { Page, NavBar, Footer } from 'ot-ui';

import Search from '../components/Search';
import { contactUrl, externalLinks } from '../constants';

const BasePage = ({ children }) => (
  <Page
    header={
      <NavBar
        name="Genetics"
        search={<Search searchLocation="navbar" />}
        docs="https://opentargets.gitbook.io/open-targets-genetics-documentation"
        api="https://genetics-docs.opentargets.org/technical-pipeline/graphql-api"
        downloads="https://genetics-docs.opentargets.org/technical-pipeline/data-download"
        contact={contactUrl}
        linkComponent={RouterLink}
      />
    }
    footer={<Footer externalLinks={externalLinks} />}
  >
    <Helmet
      defaultTitle="Open Targets Genetics"
      titleTemplate="%s | Open Targets Genetics"
    />
    {children}
  </Page>
);

export default BasePage;
