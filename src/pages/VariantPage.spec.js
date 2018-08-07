import React from 'react';
import { shallow } from 'enzyme';

import VariantPage from './VariantPage';

it('renders without crashing (shallow)', () => {
  const match = {
    params: {
      variantId: '1_100314838_C_T',
    },
  };
  shallow(<VariantPage match={match} />);
});
