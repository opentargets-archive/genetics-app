import React from 'react';
import { Helmet } from 'react-helmet';
import * as d3 from 'd3';

import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import {
  Tab,
  Tabs,
  SectionHeading,
  PlotContainer,
  PlotContainerSection,
  significantFigures,
} from 'ot-ui';
import { GeneTrack } from 'ot-charts';

import BasePage from './BasePage';
import ColocQTLTable from '../components/ColocQTLTable';
import ColocQTLGeneTissueTable from '../components/ColocQTLGeneTissueTable';
import ColocGWASTable from '../components/ColocGWASTable';
import ColocGWASHeatmapTable from '../components/ColocGWASHeatmapTable';
import CredibleSetWithRegional from '../components/CredibleSetWithRegional';
import Slider from '../components/Slider';

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
    credSet95Value: 'all',
    logH4H3SliderValue: Math.log(2), // ln(2) equivalent to H4 being double H3; suggested by Ed
    h4SliderValue: 0.2, // 20% default; suggested by Ed
  };
  handleQtlTabsChange = (_, qtlTabsValue) => {
    this.setState({ qtlTabsValue });
  };
  handleGWASTabsChange = (_, gwasTabsValue) => {
    this.setState({ gwasTabsValue });
  };
  handleCredSet95Change = event => {
    this.setState({ credSet95Value: event.target.value });
  };
  handleLogH4H3SliderChange = (_, logH4H3SliderValue) => {
    this.setState({ logH4H3SliderValue });
  };
  handleH4SliderChange = (_, h4SliderValue) => {
    this.setState({ h4SliderValue });
  };
  render() {
    const colocQtlTableDataWithState = COLOC_QTL_TABLE_DATA;
    const colocGWASTableDataWithState = COLOC_GWAS_TABLE_DATA.map(d => ({
      ...d,
      ...STUDY_INFOS[d.study],
    }));

    const maxQtlLogH4H3 = d3.max(colocQtlTableDataWithState, d => d.logH4H3);
    const maxGWASLogH4H3 = d3.max(colocGWASTableDataWithState, d => d.logH4H3);
    const maxLogH4H3 = d3.max([maxQtlLogH4H3, maxGWASLogH4H3]);

    const colocGWASTableDataWithStateFiltered = colocGWASTableDataWithState
      .filter(d => d.logH4H3 >= this.state.logH4H3SliderValue)
      .filter(d => d.h4 >= this.state.h4SliderValue);

    const colocQtlTableDataWithStateFiltered = colocQtlTableDataWithState
      .filter(d => d.logH4H3 >= this.state.logH4H3SliderValue)
      .filter(d => d.h4 >= this.state.h4SliderValue);

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
            data={colocQtlTableDataWithState}
            handleToggleRegional={this.handleToggleRegional}
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
            studiesMetaData={STUDY_INFOS}
          />
        ) : null}
        {this.state.gwasTabsValue === 'table' ? (
          <ColocGWASTable
            loading={false}
            error={false}
            data={colocGWASTableDataWithState}
            handleToggleRegional={this.handleToggleRegional}
          />
        ) : null}

        <SectionHeading
          heading={`Credible Set Overlap`}
          subheading={`Which variants at this locus are most likely causal?`}
        />
        <PlotContainer
          center={
            <Typography>
              Showing credible sets for{' '}
              <strong>{traitAuthorYear(STUDY_INFO)}</strong> and GWAS
              studies/QTLs in colocalisation. Expand the section to see the
              underlying regional plot.
            </Typography>
          }
        >
          <PlotContainerSection>
            <Grid container alignItems="center">
              <Grid item>
                <div style={{ padding: '0 20px' }}>
                  <Typography>Credible set variants</Typography>
                  <RadioGroup
                    style={{ padding: '0 16px' }}
                    row
                    aria-label="95% credible set"
                    name="credset95"
                    value={this.state.credSet95Value}
                    onChange={this.handleCredSet95Change}
                  >
                    <FormControlLabel
                      value="95"
                      control={<Radio />}
                      label="95%"
                    />
                    <FormControlLabel
                      value="all"
                      control={<Radio />}
                      label="all"
                    />
                  </RadioGroup>
                </div>
              </Grid>
              <Grid item>
                <Slider
                  label={`log(H4/H3) - ${significantFigures(
                    this.state.logH4H3SliderValue
                  )}`}
                  min={0}
                  max={Math.ceil(maxLogH4H3)}
                  step={Math.ceil(maxLogH4H3) / 50}
                  value={this.state.logH4H3SliderValue}
                  onChange={this.handleLogH4H3SliderChange}
                />
              </Grid>
              <Grid item>
                <Slider
                  label={`H4 - ${significantFigures(this.state.h4SliderValue)}`}
                  min={0}
                  max={1}
                  step={0.02}
                  value={this.state.h4SliderValue}
                  onChange={this.handleH4SliderChange}
                />
              </Grid>
            </Grid>
          </PlotContainerSection>
        </PlotContainer>

        <CredibleSetWithRegional
          credibleSetProps={{
            label: traitAuthorYear(STUDY_INFO),
            start: START,
            end: END,
            data: pageCredibleSet,
          }}
          regionalProps={{
            data: SUMSTATS_PAGE_STUDY,
            title: null,
            start: START,
            end: END,
          }}
        />

        <Typography style={{ paddingTop: '10px' }}>
          <strong>GWAS</strong>
        </Typography>

        {colocGWASTableDataWithStateFiltered
          .sort(logH4H3Comparator)
          .reverse()
          .map(d => {
            const { study, chrom, pos, ref, alt } = d;
            const key = `${study}__null__null__${chrom}__${pos}__${ref}__${alt}`;
            return Object.keys(CREDSETS_TABLE_DATA).indexOf(key) >= 0 &&
              CREDSETS_TABLE_DATA[key].length > 0 ? (
              <CredibleSetWithRegional
                key={key}
                credibleSetProps={{
                  label: traitAuthorYear(STUDY_INFOS[d.study]),
                  start: START,
                  end: END,
                  data:
                    this.state.credSet95Value === 'all'
                      ? CREDSETS_TABLE_DATA[key]
                      : CREDSETS_TABLE_DATA[key].filter(d => d.is95CredibleSet),
                }}
                regionalProps={{
                  data: combineSumStatsWithCredSets({
                    ...d,
                    chromosome: CHROMOSOME,
                  }),
                  title: null,
                  start: START,
                  end: END,
                }}
              />
            ) : null;
          })}

        {colocGWASTableDataWithStateFiltered.length === 0 ? (
          <Typography align="center">
            No GWAS studies satisfying the applied filters.
          </Typography>
        ) : null}

        <Typography style={{ paddingTop: '10px' }}>
          <strong>QTLs</strong>
        </Typography>

        {colocQtlTableDataWithStateFiltered
          .sort(logH4H3Comparator)
          .reverse()
          .map(d => {
            const {
              study,
              phenotype,
              phenotypeSymbol,
              bioFeature,
              chrom,
              pos,
              ref,
              alt,
            } = d;
            const key = `${study}__${phenotype}__${bioFeature}__${chrom}__${pos}__${ref}__${alt}`;
            return Object.keys(CREDSETS_TABLE_DATA).indexOf(key) >= 0 &&
              CREDSETS_TABLE_DATA[key].length > 0 ? (
              <CredibleSetWithRegional
                key={key}
                credibleSetProps={{
                  label: `${study}: ${phenotypeSymbol} in ${bioFeature}`,
                  start: START,
                  end: END,
                  data:
                    this.state.credSet95Value === 'all'
                      ? CREDSETS_TABLE_DATA[key]
                      : CREDSETS_TABLE_DATA[key].filter(d => d.is95CredibleSet),
                }}
                regionalProps={{
                  data: combineSumStatsWithCredSets({
                    ...d,
                    chromosome: CHROMOSOME,
                  }),
                  title: null,
                  start: START,
                  end: END,
                }}
              />
            ) : null;
          })}

        {colocQtlTableDataWithStateFiltered.length === 0 ? (
          <Typography align="center">
            No QTLs satisfying the applied filters.
          </Typography>
        ) : null}

        <Typography style={{ paddingTop: '10px' }}>
          <strong>Genes</strong>
        </Typography>
        <PlotContainer>
          <PlotContainerSection>
            <div style={{ paddingRight: '32px' }}>
              <GeneTrack
                data={flatExonsToPairedExons(GENES)}
                start={START}
                end={END}
              />
            </div>
          </PlotContainerSection>
        </PlotContainer>

        <SectionHeading
          heading={`Genes`}
          subheading={`Which genes are functionally implicated by variants at this locus?`}
        />
      </BasePage>
    );
  }
}

export default LocusTraitPage;
