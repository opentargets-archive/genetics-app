import React from 'react';
import { Helmet } from 'react-helmet';

import { Page } from '../ot-ui-components';

import Search from '../components/Search';
import NavBar from '../components/NavBar/NavBar';
import { externalLinks, mainMenuItems } from '../constants';
import Footer from '../components/Footer';

const BasePage = ({ children }) => (
  <Page
    header={
      <NavBar
        name="Genetics"
        items={mainMenuItems}
        search={<Search searchLocation="navbar" white />}
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
