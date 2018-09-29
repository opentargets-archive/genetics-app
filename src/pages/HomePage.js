import React from 'react';
import { Helmet } from 'react-helmet';

import { Splash, HomeBox, SearchExamples } from 'ot-ui';

import Search from '../components/Search';

// TODO: connect these
// const LUCKY_EXAMPLES = [
//   '/study-comparison/GCST006061?studyIds=GCST004297&studyIds=GCST004373&studyIds=GCST001499&studyIds=GCST004295',
//   '/study-comparison/GCST003048?studyIds=GCST004946&studyIds=GCST002539&studyIds=GCST001242&studyIds=GCST001565',
//   '/locus?chromosome=1&end=99512127&selectedStudies=GCST003048&selectedStudies=GCST004946&selectedStudies=GCST002539&selectedStudies=GCST001242&selectedStudies=GCST001565&start=97512127',
// ];

const EXAMPLES = [
  { label: 'PCSK9', url: '/gene/ENSG00000169174' },
  { label: '1_154426264_C_T', url: '/variant/1_154426264_C_T' },
  {
    label: 'Atrial fibrillation (Roselli C et al. 2018)',
    url: '/study/GCST006061',
  },
];

const HomePage = () => (
  <div>
    <Helmet>
      <title>Open Targets Genetics</title>
    </Helmet>
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
