import React from 'react';
import { Regional } from 'ot-charts';

import BasePage from './BasePage';

const RegionalPage = ({ match }) => (
  <BasePage>
    <h1>{`Regional ${match.params.studyId}, ${match.params.variantId}`}</h1>
    <Regional />
  </BasePage>
);

export default RegionalPage;
