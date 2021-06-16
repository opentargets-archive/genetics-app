import React from 'react';
import { Helmet } from 'react-helmet';

import { Page, Footer } from 'ot-ui';

import Search from '../components/Search';
import NavBar from '../components/NavBar/NavBar';
import { contactUrl, externalLinks } from '../constants';

const BasePage = ({ children }) => (
  <Page
    header={
      <NavBar
        name="Genetics"
        search={<Search searchLocation="navbar" />}
        docs="https://genetics-docs.opentargets.org/"
        api="https://genetics-docs.opentargets.org/data-access/graphql-api"
        downloads="https://genetics-docs.opentargets.org/data-access/data-download"
        community="https://community.opentargets.org/"
        contact={contactUrl}
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
