import React from 'react';
import { Helmet } from 'react-helmet';
import { Gecko } from 'ot-charts';
import { PageTitle, Heading, SubHeading } from 'ot-ui';

import BasePage from './BasePage';

const LocusPage = () => (
  <BasePage>
    <Helmet>
      <title>Locus</title>
    </Helmet>
    <PageTitle>Locus</PageTitle>
    <hr />
    <Heading>Associations</Heading>
    <SubHeading>What genetic evidence is there within this locus?</SubHeading>
    <Gecko />
  </BasePage>
);

export default LocusPage;
