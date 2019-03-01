import React from 'react';
import { Helmet } from 'react-helmet';

import { SectionHeading } from 'ot-ui';

import BasePage from './BasePage';
import ColocTable from '../components/ColocTable';

const MOCK_COLOC_DATA = [];

class LocusTraitPage extends React.Component {
  render() {
    const { match } = this.props;
    const { studyId, indexVariantId } = match.params;
    return (
      <BasePage>
        <Helmet>
          <title>
            ({studyId}, {indexVariantId})
          </title>
        </Helmet>
        <SectionHeading
          heading={`Colocalisation`}
          subheading={`Which molecular traits colocalise with ${studyId}?`}
          entities={[
            {
              type: 'study',
              fixed: false,
            },
            {
              type: 'indexVariant',
              fixed: true,
            },
          ]}
        />
        <ColocTable loading={false} error={false} data={MOCK_COLOC_DATA} />
      </BasePage>
    );
  }
}

export default LocusTraitPage;
