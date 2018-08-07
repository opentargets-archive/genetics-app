import React from 'react';
import { shallow } from 'enzyme';

import GenePage from './GenePage';

it('renders without crashing (shallow)', () => {
  const match = { params: { geneId: 'ENSG00000157764' } };
  shallow(<GenePage match={match} />);
});
