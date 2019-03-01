import React from 'react';
import { Helmet } from 'react-helmet';

import { SectionHeading } from 'ot-ui';

import BasePage from './BasePage';
import ColocTable from '../components/ColocTable';
import CredibleSetTrackPlot from '../components/CredibleSetTrackPlot';
import {
  MOCK_COLOC_DATA,
  MOCK_CREDIBLE_SET_TRACK_PLOT,
} from '../mock-data/locusTraitPage';

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
          heading={`Causality`}
          subheading={`Which variants at this locus are most likely causal?`}
        />
        <CredibleSetTrackPlot data={MOCK_CREDIBLE_SET_TRACK_PLOT} />
        <SectionHeading
          heading={`Colocalisation`}
          subheading={`Which molecular traits colocalise with ${studyId}?`}
        />
        <ColocTable loading={false} error={false} data={MOCK_COLOC_DATA} />
        <SectionHeading
          heading={`Gene`}
          subheading={`Which genes colocalise with ${studyId} at this locus (and in which tissues)?`}
        />
        <ColocTable loading={false} error={false} data={MOCK_COLOC_DATA} />
      </BasePage>
    );
  }
}

export default LocusTraitPage;
