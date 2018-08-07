import React from 'react';

import { Splash, HomeBox, Search, SearchExamples } from 'ot-ui';

const EXAMPLES = [
  { label: 'CDK6', url: '/gene/ENSG00000105810' },
  { label: '1_100314838_C_T', url: '/variant/1_100314838_C_T' },
  { label: 'Blood protein levels (Sun BB; 2018)', url: '/study/GCST005806' },
];

const HomePage = () => (
  <div>
    <Splash />
    <HomeBox name="Genetics">
      <Search />
      <SearchExamples examples={EXAMPLES} />
      <p>
        This platform uses GRCh37 from the{' '}
        <a href="https://www.ncbi.nlm.nih.gov/grc">
          Genome Reference Consortium
        </a>
      </p>
    </HomeBox>
  </div>
);

export default HomePage;
