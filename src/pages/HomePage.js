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
    label: "Crohn's disease (de Lange KM et al. 2017)",
    url: '/study/GCST004132',
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
    </HomeBox>
  </div>
);

export default HomePage;
