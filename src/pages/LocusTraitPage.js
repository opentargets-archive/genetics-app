import React from 'react';
import { Helmet } from 'react-helmet';
import Typography from '@material-ui/core/Typography';

import { SectionHeading } from 'ot-ui';

import BasePage from './BasePage';
import StudyInfo from '../components/StudyInfo';
import ColocTable from '../components/ColocTable';
import CredibleSetTrackPlot from '../components/CredibleSetTrackPlot';
import {
  MOCK_STUDY_INFO,
  MOCK_INDEX_VARIANT_INFO,
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
          <title>{`(${studyId}, ${indexVariantId})`}</title>
        </Helmet>
        <Typography variant="h4" color="textSecondary">
          {`${MOCK_STUDY_INFO.traitReported}`}
        </Typography>
        <Typography variant="subtitle1">
          <StudyInfo studyInfo={MOCK_STUDY_INFO} />
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {`Locus near ${MOCK_INDEX_VARIANT_INFO.id} (${
            MOCK_INDEX_VARIANT_INFO.rsId
          })`}
        </Typography>

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
      </BasePage>
    );
  }
}

export default LocusTraitPage;
