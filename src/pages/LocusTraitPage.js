import React from 'react';
import { Helmet } from 'react-helmet';
import Typography from '@material-ui/core/Typography';

import { SectionHeading } from 'ot-ui';
import { GeneTrack } from 'ot-charts';

import BasePage from './BasePage';
import StudyInfo from '../components/StudyInfo';
import ColocTable from '../components/ColocTable';
import CredibleSetTrackPlot from '../components/CredibleSetTrackPlot';
import {
  MOCK_STUDY_INFO,
  MOCK_INDEX_VARIANT_INFO,
  MOCK_COLOC_DATA,
  MOCK_CREDIBLE_SET_TRACK_PLOT,
  MOCK_REGIONAL_DATA_GENES,
  MOCK_REGIONAL_START,
  MOCK_REGIONAL_END,
} from '../mock-data/locusTraitPage';

// gene exons come as flat list, rendering expects list of pairs
const flatExonsToPairedExons = ({ genes }) => {
  const paired = genes.map(d => ({
    ...d,
    exons: d.exons.reduce((result, value, index, array) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }
      return result;
    }, []),
  }));
  return { genes: paired };
};

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
          heading={`Credible set overlap`}
          subheading={`Which variants at this locus are most likely causal?`}
        />
        <CredibleSetTrackPlot data={MOCK_CREDIBLE_SET_TRACK_PLOT} />
        <SectionHeading
          heading={`Colocalisation`}
          subheading={`Which studies/molecular traits colocalise with ${studyId} at this locus?`}
        />
        <ColocTable loading={false} error={false} data={MOCK_COLOC_DATA} />
        <GeneTrack
          data={flatExonsToPairedExons(MOCK_REGIONAL_DATA_GENES)}
          start={MOCK_REGIONAL_START}
          end={MOCK_REGIONAL_END}
        />
        <SectionHeading
          heading={``}
          subheading={`Which genes colocalise with ${studyId} at this locus (and in which tissues)?`}
        />
        <SectionHeading
          heading={`Gene`}
          subheading={`Which genes are functionally implicated at this locus?`}
        />
      </BasePage>
    );
  }
}

export default LocusTraitPage;
