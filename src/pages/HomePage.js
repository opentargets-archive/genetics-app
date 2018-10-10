import React from 'react';
import { Helmet } from 'react-helmet';

import { Splash, HomeBox, Typography } from 'ot-ui';

import Search from '../components/Search';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

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

const clickExample = type => () => {
  reportAnalyticsEvent({
    category: 'home-example',
    action: 'click',
    label: type,
  });
};

const HomePage = () => (
  <div>
    <Helmet>
      <title>Open Targets Genetics</title>
    </Helmet>
    <Splash />
    <HomeBox name="Genetics">
      <Search />
      <Typography style={{ marginTop: '25px' }}>
        Examples:
        <br />
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
      </Typography>
      <Typography style={{ marginTop: '25px', textAlign: 'center' }}>
        <a
          href="http://eepurl.com/dHnchn"
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe to our newsletter
        </a>
      </Typography>
    </HomeBox>
  </div>
);

export default HomePage;
