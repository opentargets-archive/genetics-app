import React from 'react';
import { shallow } from 'enzyme';

import LocusPage from './LocusPage';

it('renders without crashing (shallow)', () => {
  shallow(<LocusPage />);
});
