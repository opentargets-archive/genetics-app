import React from 'react';
import { Helmet } from 'react-helmet';
import Typography from '@material-ui/core/Typography';

import { SectionHeading } from 'ot-ui';
import { Regional, GeneTrack, SigSig } from 'ot-charts';

import BasePage from './BasePage';
import StudyInfo from '../components/StudyInfo';
import ColocQTLTable from '../components/ColocQTLTable';
import ColocQTLGeneTissueTable from '../components/ColocQTLGeneTissueTable';
import ColocGWASTable from '../components/ColocGWASTable';
import CredibleSetTrackPlot from '../components/CredibleSetTrackPlot';
import {
  // MOCK_STUDY_INFO,
  MOCK_INDEX_VARIANT_INFO,
  MOCK_CREDIBLE_SET_TRACK_PLOT,
  // MOCK_REGIONAL_DATA_GENES,
  // MOCK_REGIONAL_START,
  // MOCK_REGIONAL_END,
  // MOCK_REGIONAL_DATA_1,
  // MOCK_REGIONAL_DATA_2,
  // MOCK_REGIONAL_DATA_3,
  // MOCK_SIG_SIG_DATA,
} from '../mock-data/locusTraitPage';

import STUDY_INFOS from '../mock-data/study-info.json';

import PAGE_SUMMARY_DATA from '../mock-data/page-summary.json';
import COLOC_QTL_TABLE_DATA from '../mock-data/coloc-qtl-table.json';
import COLOC_GWAS_TABLE_DATA from '../mock-data/coloc-gwas-table.json';
import SUMSTATS_TABLE_DATA from '../mock-data/sum-stats-table.json';

const STUDY_ID = PAGE_SUMMARY_DATA['study'];
const STUDY_INFO = STUDY_INFOS[STUDY_ID];
const CHROMOSOME = PAGE_SUMMARY_DATA['chromosome'];
const POSITION = PAGE_SUMMARY_DATA['position'];
const VARIANT_ID = `${CHROMOSOME}_${POSITION}_${PAGE_SUMMARY_DATA.ref}_${
  PAGE_SUMMARY_DATA.alt
}`;
const HALF_WINDOW = 500000;
const START = POSITION - HALF_WINDOW;
const END = POSITION + HALF_WINDOW;

console.log(SUMSTATS_TABLE_DATA);
const PAGE_KEY = `${PAGE_SUMMARY_DATA['study']}__null__null__${
  PAGE_SUMMARY_DATA['chromosome']
}`;
console.log(PAGE_KEY);
const SUMSTATS_PAGE_STUDY = SUMSTATS_TABLE_DATA[PAGE_KEY];
console.log(SUMSTATS_PAGE_STUDY);

// const titles = [MOCK_STUDY_INFO.traitReported, 'eQTL 1', 'eQTL 2'];

// // gene exons come as flat list, rendering expects list of pairs
// const flatExonsToPairedExons = ({ genes }) => {
//   const paired = genes.map(d => ({
//     ...d,
//     exons: d.exons.reduce((result, value, index, array) => {
//       if (index % 2 === 0) {
//         result.push(array.slice(index, index + 2));
//       }
//       return result;
//     }, []),
//   }));
//   return { genes: paired };
// };

class LocusTraitPage extends React.Component {
  render() {
    // const { match } = this.props;
    // const { studyId, indexVariantId } = match.params;

    return (
      <BasePage>
        <Helmet>
          <title>{`(${STUDY_ID}, ${VARIANT_ID})`}</title>
        </Helmet>
        <Typography variant="h4" color="textSecondary">
          {`${STUDY_INFO.traitReported}`}
        </Typography>
        <Typography variant="subtitle1">
          <StudyInfo studyInfo={STUDY_INFO} />
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {`Locus near ${VARIANT_ID} (${MOCK_INDEX_VARIANT_INFO.rsId})`}
        </Typography>

        <SectionHeading
          heading={`QTL Colocalisation`}
          subheading={
            <React.Fragment>
              Which molecular traits colocalise with{' '}
              <strong>{STUDY_INFO.traitReported}</strong> at this locus?
            </React.Fragment>
          }
        />
        <ColocQTLGeneTissueTable
          loading={false}
          error={false}
          data={COLOC_QTL_TABLE_DATA}
        />
        <ColocQTLTable
          loading={false}
          error={false}
          data={COLOC_QTL_TABLE_DATA}
        />

        <SectionHeading
          heading={`GWAS Study Colocalisation`}
          subheading={
            <React.Fragment>
              Which GWAS studies colocalise with{' '}
              <strong>{STUDY_INFO.traitReported}</strong> at this locus?
            </React.Fragment>
          }
        />
        <ColocGWASTable
          loading={false}
          error={false}
          data={COLOC_GWAS_TABLE_DATA}
        />

        {/* <SigSig data={MOCK_SIG_SIG_DATA} /> */}
        <Regional
          data={SUMSTATS_PAGE_STUDY}
          title={STUDY_INFO.traitReported}
          start={START}
          end={END}
        />
        {/* <Regional
          data={MOCK_REGIONAL_DATA_2}
          title={titles[1]}
          start={MOCK_REGIONAL_START}
          end={MOCK_REGIONAL_END}
        />
        <Regional
          data={MOCK_REGIONAL_DATA_3}
          title={titles[2]}
          start={MOCK_REGIONAL_START}
          end={MOCK_REGIONAL_END}
        /> */}
        {/* <GeneTrack
          data={flatExonsToPairedExons(MOCK_REGIONAL_DATA_GENES)}
          start={MOCK_REGIONAL_START}
          end={MOCK_REGIONAL_END}
        /> */}
        {/* <SectionHeading
          heading={``}
          subheading={
            <React.Fragment>
              Which genes colocalise with{' '}
              <strong>{STUDY_INFO.traitReported}</strong> at this locus (and in
              which tissues)?
            </React.Fragment>
          }
        /> */}
        <SectionHeading
          heading={`Genes`}
          subheading={`Which genes are functionally implicated by variants at this locus?`}
        />
        <SectionHeading
          heading={`Credible set overlap`}
          subheading={`Which variants at this locus are most likely causal?`}
        />
        <CredibleSetTrackPlot data={MOCK_CREDIBLE_SET_TRACK_PLOT} />
      </BasePage>
    );
  }
}

export default LocusTraitPage;
