import React from 'react';
import { Regional } from 'ot-charts';
import { PageTitle } from 'ot-ui';

import BasePage from './BasePage';

const RegionalPage = ({ match }) => (
  <BasePage>
    <PageTitle>{`Regional ${match.params.studyId}, ${
      match.params.variantId
    }`}</PageTitle>
    <hr />
    <Regional />
  </BasePage>
);

export default RegionalPage;
