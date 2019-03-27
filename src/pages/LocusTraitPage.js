import React from 'react';
import { Helmet } from 'react-helmet';
import Typography from '@material-ui/core/Typography';

import { SectionHeading, PlotContainer } from 'ot-ui';
import { Regional, GeneTrack, SigSig } from 'ot-charts';

import BasePage from './BasePage';
import StudyInfo from '../components/StudyInfo';
import ColocQTLTable from '../components/ColocQTLTable';
import ColocQTLGeneTissueTable from '../components/ColocQTLGeneTissueTable';
import ColocGWASTable from '../components/ColocGWASTable';
import ColocGWASHeatmapTable from '../components/ColocGWASHeatmapTable';
import CredibleSetTrackPlot from '../components/CredibleSetTrackPlot';

import STUDY_INFOS from '../mock-data/study-info.json';

import PAGE_SUMMARY_DATA from '../mock-data/specific/page-summary.json';
import COLOC_QTL_TABLE_DATA from '../mock-data/specific/coloc-qtl-table.json';
import COLOC_GWAS_TABLE_DATA from '../mock-data/specific/coloc-gwas-table.json';
import COLOC_GWAS_HEATMAP_TABLE_DATA from '../mock-data/specific/coloc-gwas-heatmap-table.json';
import SUMSTATS_TABLE_DATA from '../mock-data/specific/sum-stats-table.json';
import GENE_DATA from '../mock-data/genes.json';

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

const GENES = { genes: GENE_DATA };

const PAGE_KEY = `${PAGE_SUMMARY_DATA['study']}__null__null__${CHROMOSOME}`;
const SUMSTATS_PAGE_STUDY = SUMSTATS_TABLE_DATA[PAGE_KEY];

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
          {`Locus near ${VARIANT_ID}`}
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
        <ColocGWASHeatmapTable
          loading={false}
          error={false}
          data={COLOC_GWAS_HEATMAP_TABLE_DATA}
        />
        <ColocGWASTable
          loading={false}
          error={false}
          data={COLOC_GWAS_TABLE_DATA}
        />

        <PlotContainer>
          {/* <SigSig data={MOCK_SIG_SIG_DATA} /> */}
          <Regional
            data={SUMSTATS_PAGE_STUDY}
            title={STUDY_INFO.traitReported}
            start={START}
            end={END}
          />
          {COLOC_GWAS_TABLE_DATA.filter(d => d.logH4H3 > 1).map(d => (
            <Regional
              key={`${d.study}`}
              data={
                SUMSTATS_TABLE_DATA[`${d.study}__null__null__${CHROMOSOME}`]
              }
              title={STUDY_INFOS[d.study].traitReported}
              start={START}
              end={END}
            />
          ))}
          {COLOC_QTL_TABLE_DATA.filter(d => d.logH4H3 > 1).map(d => (
            <Regional
              key={`${d.phenotype}-${d.bioFeature}`}
              data={
                SUMSTATS_TABLE_DATA[
                  `${d.study}__${d.phenotype}__${d.bioFeature}__${CHROMOSOME}`
                ]
              }
              title={`${d.study}: ${d.phenotypeSymbol} in ${d.bioFeature}`}
              start={START}
              end={END}
            />
          ))}
          <GeneTrack
            data={flatExonsToPairedExons(GENES)}
            start={START}
            end={END}
          />
        </PlotContainer>
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
        {/* <CredibleSetTrackPlot data={MOCK_CREDIBLE_SET_TRACK_PLOT} /> */}
      </BasePage>
    );
  }
}

export default LocusTraitPage;
