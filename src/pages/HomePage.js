import React from 'react';
import { Helmet } from 'react-helmet';

import { Splash, HomeBox, Button, Typography } from 'ot-ui';

import Search from '../components/Search';
import reportAnalyticsEvent from './reportAnalyticsEvent';

const LUCKY_EXAMPLES = [
  '/study-comparison/GCST006061?studyIds=GCST004297&studyIds=GCST004373&studyIds=GCST001499&studyIds=GCST004295',
  '/study-comparison/GCST003048?studyIds=GCST004946&studyIds=GCST002539&studyIds=GCST001242&studyIds=GCST001565',
  '/locus?chromosome=1&end=99512127&selectedStudies=GCST003048&selectedStudies=GCST004946&selectedStudies=GCST002539&selectedStudies=GCST001242&selectedStudies=GCST001565&start=97512127',
];

const EXAMPLES = [
  { label: 'PCSK9', url: '/gene/ENSG00000169174', type: 'gene' },
  {
    label: '1_154426264_C_T',
    url: '/variant/1_154426264_C_T',
    type: 'variant-id',
  },
  { label: 'rs4129267', url: '/variant/1_154426264_C_T', type: 'variant-rsid' },
  {
    label: "Crohn's disease (de Lange KM et al. 2017)",
    url: '/study/GCST004132',
    type: 'study',
  },
];

const lucky = history => () => {
  const url = LUCKY_EXAMPLES[Math.floor(Math.random() * LUCKY_EXAMPLES.length)];
  history.push(url);
};

const clickExample = type => () => {
  reportAnalyticsEvent({
    category: 'home-example',
    action: 'click',
    label: type,
  });
};

const HomePage = ({ history }) => (
  <div>
    <Helmet>
      <title>Open Targets Genetics</title>
    </Helmet>
    <Splash />
    <HomeBox name="Genetics">
      <Search />
      <Typography style={{ marginTop: '25px' }}>
        {EXAMPLES.map((d, i) => (
          <a
            key={i}
            href={d.url}
            style={{ marginRight: '15px' }}
            onClick={clickExample(d.type)}
          >
            {d.label}
          </a>
        ))}
        <Button style={{ float: 'right' }} gradient onClick={lucky(history)}>
          I'm feeling lucky
        </Button>
      </Typography>
    </HomeBox>
  </div>
);

export default HomePage;
