import React from 'react';
import { shallow } from 'enzyme';

import RegionalPage from './RegionalPage';

it('renders without crashing (shallow)', () => {
  const match = {
    params: {
      studyId: 'GCST005806',
      variantId: '1_100314838_C_T',
    },
  };
  shallow(<RegionalPage match={match} />);
});
