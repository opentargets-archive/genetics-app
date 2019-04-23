import React from 'react';
import { Helmet } from 'react-helmet';
import Typography from '@material-ui/core/Typography';

import { Tab, Tabs, SectionHeading, PlotContainer } from 'ot-ui';
import { Regional, GeneTrack } from 'ot-charts';

import BasePage from './BasePage';
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
import CREDSETS_TABLE_DATA from '../mock-data/specific/credible-sets-table.json';
import GENE_DATA from '../mock-data/genes.json';

// helper to augment summary stats with credible set information
const combineSumStatsWithCredSets = ({
  study,
  phenotype,
  bioFeature,
  chromosome,
  pos: position,
  ref,
  alt,
}) => {
  const ssKey = `${study}__${phenotype ? phenotype : 'null'}__${
    bioFeature ? bioFeature : 'null'
  }__${chromosome}`;
  const csKey = `${study}__${phenotype ? phenotype : 'null'}__${
    bioFeature ? bioFeature : 'null'
  }__${chromosome}__${position}__${ref}__${alt}`;
  const ss = SUMSTATS_TABLE_DATA[ssKey];
  const vKey = ({ chromosome, position, ref, alt }) =>
    `${chromosome}__${position}__${ref}__${alt}`;
  const lookup = CREDSETS_TABLE_DATA[csKey].reduce((acc, d) => {
    acc[vKey(d)] = d;
    return acc;
  }, {});
  const ssWith = ss.map(d => {
    if (Object.keys(lookup).indexOf(vKey(d)) >= 0) {
      const {
        posteriorProbability,
        logABF,
        is95CredibleSet,
        is99CredibleSet,
      } = lookup[vKey(d)];
      return {
        ...d,
        posteriorProbability,
        logABF,
        is95CredibleSet,
        is99CredibleSet,
      };
    } else {
      return d;
    }
  });
  return ssWith;
};

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

const generateComparatorFromAccessor = accessor => (a, b) => {
  const aValue = accessor(a);
  const bValue = accessor(b);
  return aValue > bValue ? 1 : aValue === bValue ? 0 : -1;
};
const logH4H3Comparator = generateComparatorFromAccessor(d => d.logH4H3);

const traitAuthorYear = s =>
  `${s.traitReported} (${s.pubAuthor}, ${new Date(s.pubDate).getFullYear()})`;

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

const PAGE_CREDSET_KEY = `${STUDY_ID}__null__null__${CHROMOSOME}__${POSITION}__${
  PAGE_SUMMARY_DATA.ref
}__${PAGE_SUMMARY_DATA.alt}`;

const pageCredibleSet = CREDSETS_TABLE_DATA[PAGE_CREDSET_KEY];

class LocusTraitPage extends React.Component {
  state = {
    qtlTabsValue: 'heatmap',
    gwasTabsValue: 'heatmap',
  };
  handleQtlTabsChange = (_, qtlTabsValue) => {
    this.setState({ qtlTabsValue });
  };
  handleGWASTabsChange = (_, gwasTabsValue) => {
    this.setState({ gwasTabsValue });
  };
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
          {STUDY_INFO.pubAuthor}{' '}
          {STUDY_INFO.pubDate
            ? `(${new Date(STUDY_INFO.pubDate).getFullYear()})`
            : null}{' '}
          {STUDY_INFO.pubJournal ? <em>{STUDY_INFO.pubJournal}</em> : null}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {`Locus around ${VARIANT_ID}`}
        </Typography>

        <SectionHeading
          heading={`QTL Colocalisation`}
          subheading={
            <React.Fragment>
              Which molecular traits colocalise with{' '}
              <strong>{traitAuthorYear(STUDY_INFO)}</strong> at this locus?
            </React.Fragment>
          }
        />
        <Tabs
          variant="scrollable"
          value={this.state.qtlTabsValue}
          onChange={this.handleQtlTabsChange}
        >
          <Tab label="Heatmap" value={'heatmap'} />
          <Tab label="Table" value={'table'} />
        </Tabs>

        {this.state.qtlTabsValue === 'heatmap' ? (
          <ColocQTLGeneTissueTable
            loading={false}
            error={false}
            data={COLOC_QTL_TABLE_DATA}
          />
        ) : null}
        {this.state.qtlTabsValue === 'table' ? (
          <ColocQTLTable
            loading={false}
            error={false}
            data={COLOC_QTL_TABLE_DATA}
          />
        ) : null}

        <SectionHeading
          heading={`GWAS Study Colocalisation`}
          subheading={
            <React.Fragment>
              Which GWAS studies colocalise with{' '}
              <strong>{traitAuthorYear(STUDY_INFO)}</strong> at this locus?
            </React.Fragment>
          }
        />
        <Tabs
          variant="scrollable"
          value={this.state.gwasTabsValue}
          onChange={this.handleGWASTabsChange}
        >
          <Tab label="Heatmap" value={'heatmap'} />
          <Tab label="Table" value={'table'} />
        </Tabs>
        {this.state.gwasTabsValue === 'heatmap' ? (
          <ColocGWASHeatmapTable
            loading={false}
            error={false}
            data={COLOC_GWAS_HEATMAP_TABLE_DATA}
          />
        ) : null}
        {this.state.gwasTabsValue === 'table' ? (
          <ColocGWASTable
            loading={false}
            error={false}
            data={COLOC_GWAS_TABLE_DATA}
          />
        ) : null}

        <SectionHeading
          heading={`Regional plots`}
          subheading={
            <React.Fragment>
              See molecular traits and GWAS studies colocalising with{' '}
              <strong>{traitAuthorYear(STUDY_INFO)}</strong> at this locus
              (select in the tables above).
            </React.Fragment>
          }
        />
        <PlotContainer
          center={
            <Typography>
              Regional plots: page study; other GWAS studies with log(H4/H3) >
              1; QTL studies with log(H4/H3) > 1
            </Typography>
          }
        >
          <Regional
            data={SUMSTATS_PAGE_STUDY}
            title={traitAuthorYear(STUDY_INFO)}
            start={START}
            end={END}
          />
          {COLOC_GWAS_TABLE_DATA.filter(d => d.logH4H3 > 1)
            .sort(logH4H3Comparator)
            .reverse()
            .map(d => (
              <Regional
                key={`${d.study}`}
                data={combineSumStatsWithCredSets({
                  ...d,
                  chromosome: CHROMOSOME,
                })}
                title={traitAuthorYear(STUDY_INFOS[d.study])}
                start={START}
                end={END}
              />
            ))}
          {COLOC_QTL_TABLE_DATA.filter(d => d.logH4H3 > 1)
            .sort(logH4H3Comparator)
            .reverse()
            .map(d => (
              <Regional
                key={`${d.phenotype}-${d.bioFeature}`}
                data={combineSumStatsWithCredSets({
                  ...d,
                  chromosome: CHROMOSOME,
                })}
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
        <CredibleSetTrackPlot
          label="Disease credible set"
          position={POSITION}
          data={pageCredibleSet}
        />
        {Object.keys(CREDSETS_TABLE_DATA).map(key => {
          const parts = key.split('__');
          const geneId = parts[1];
          const tissueId = parts[2];
          if (geneId !== 'null' && tissueId !== 'null') {
            return (
              <CredibleSetTrackPlot
                label={key}
                position={POSITION}
                data={CREDSETS_TABLE_DATA[key]}
              />
            );
          } else {
            return null;
          }
        })}
      </BasePage>
    );
  }
}

export default LocusTraitPage;
