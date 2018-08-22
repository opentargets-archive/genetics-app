import React from 'react';
import { Helmet } from 'react-helmet';
import { Regional } from 'ot-charts';
import { PageTitle } from 'ot-ui';

import BasePage from './BasePage';

const RegionalPage = ({ match }) => (
  <BasePage>
    <Helmet>
      <title>Regional</title>
    </Helmet>
    <PageTitle>{`Regional ${match.params.studyId}, ${
      match.params.variantId
    }`}</PageTitle>
    <hr />
    <Regional />
  </BasePage>
);

export default RegionalPage;
