import React from 'react';
import { Query } from 'react-apollo';
import { loader } from 'graphql.macro';
import gql from 'graphql-tag';
import { Helmet } from 'react-helmet';
import * as d3 from 'd3';

import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import {
  Link,
  Tab,
  Tabs,
  SectionHeading,
  PlotContainer,
  PlotContainerSection,
  significantFigures,
  DataDownloader,
} from 'ot-ui';
import { GeneTrack, CredibleSet } from 'ot-charts';

import BasePage from './BasePage';
import ColocQTLTable from '../components/ColocQTLTable';
import ColocQTLGeneTissueTable from '../components/ColocQTLGeneTissueTable';
import ColocGWASTable from '../components/ColocGWASTable';
import ColocL2GTable from '../components/ColocL2GTable';
// import ColocGWASHeatmapTable from '../components/ColocGWASHeatmapTable';
import CredibleSetWithRegional from '../components/CredibleSetWithRegional';
import CredibleSetsIntersectionTable from '../components/CredibleSetsIntersectionTable';
import Slider from '../components/Slider';
import LocusLink from '../components/LocusLink';

const STUDY_LOCUS_PAGE_QUERY = loader('../queries/StudyLocusPageQuery.gql');
const GWAS_REGIONAL_QUERY = loader('../queries/GWASRegionalQuery.gql');
const QTL_REGIONAL_QUERY = loader('../queries/QTLRegionalQuery.gql');

const HALF_WINDOW = 250000;

const generateComparatorFromAccessor = accessor => (a, b) => {
  const aValue = accessor(a);
  const bValue = accessor(b);
  return aValue > bValue ? 1 : aValue === bValue ? 0 : -1;
};
const log2h4h3Comparator = generateComparatorFromAccessor(d => d.log2h4h3);

const gwasCredibleSetQueryAliasedFragment = ({ study, indexVariant }) => `
gwasCredibleSet__${study.studyId}__${
  indexVariant.id
}: gwasCredibleSet(studyId: "${study.studyId}", variantId: "${
  indexVariant.id
}") {
  tagVariant {
    id
    rsId
    position
  }
  pval
  se
  beta
  postProb
  MultisignalMethod
  logABF
  is95
  is99
}
`;

const qtlCredibleSetQueryAliasedFragment = ({
  qtlStudyName,
  phenotypeId,
  tissue,
  indexVariant,
}) => `
qtlCredibleSet__${qtlStudyName}__${phenotypeId}__${tissue.id}__${
  indexVariant.id
}: qtlCredibleSet(studyId: "${qtlStudyName}", variantId: "${
  indexVariant.id
}", phenotypeId: "${phenotypeId}", bioFeature: "${tissue.id}") {
  tagVariant {
    id
    rsId
    position
  }
  pval
  se
  beta
  postProb
  MultisignalMethod
  logABF
  is95
  is99
}
`;

const flattenPosition = ({ tagVariant, postProb, is95, is99, ...rest }) => ({
  tagVariant,
  position: tagVariant.position,
  posteriorProbability: postProb,
  is95CredibleSet: is95,
  is99CredibleSet: is99,
  ...rest,
});

const traitAuthorYear = s =>
  `${s.traitReported} (${s.pubAuthor}, ${new Date(s.pubDate).getFullYear()})`;

// gene exons come as flat list, rendering expects list of pairs
const flatExonsToPairedExons = genes => {
  const paired = genes.map(d => ({
    ...d,
    exons: d.exons.reduce((result, value, index, array) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }
      return result;
    }, []),
  }));
  return paired;
};

const tableColumns = [
  {
    id: 'gene.symbol',
    label: 'Gene',
    comparator: (a, b) => d3.ascending(a.gene.symbol, b.gene.symbol),
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  },
  {
    id: 'phenotypeId',
    label: 'Molecular trait',
    // renderCell: d => (d.phenotypeId !== d.gene.id ? d.phenotypeId : null),
  },
  {
    id: 'tissue.name',
    label: 'Tissue',
    comparator: (a, b) => d3.ascending(a.tissue.name, b.tissue.name),
    renderCell: d => d.tissue.name,
  },
  {
    id: 'qtlStudyName',
    label: 'Source',
  },
  {
    id: 'indexVariant',
    label: 'Lead variant',
    comparator: (a, b) => d3.ascending(a.indexVariant.id, b.indexVariant.id),
    renderCell: d => (
      <Link to={`/variant/${d.indexVariant.id}`}>{d.indexVariant.id}</Link>
    ),
  },
  {
    id: 'beta',
    label: 'QTL beta',
    tooltip:
      'QTL effect with respect to the alternative allele of the page variant',
    renderCell: d => significantFigures(d.beta),
  },
  {
    id: 'h3',
    label: 'H3',
    tooltip: (
      <React.Fragment>
        Posterior probability that the signals <strong>do not</strong>{' '}
        colocalise
      </React.Fragment>
    ),
    renderCell: d => significantFigures(d.h3),
  },
  {
    id: 'h4',
    label: 'H4',
    tooltip: 'Posterior probability that the signals colocalise',
    renderCell: d => significantFigures(d.h4),
  },
  {
    id: 'log2h4h3',
    label: 'log2(H4/H3)',
    tooltip: 'Log-likelihood that the signals colocalise',
    renderCell: d => significantFigures(d.log2h4h3),
  },
];

const getDownloadData = data => {
  return data.map(d => ({
    'gene.symbol': d.gene.symbol,
    phenotypeId: d.phenotypeId,
    'tissue.name': d.tissue.name,
    qtlStudyName: d.qtlStudyName,
    indexVariant: d.indexVariant.id,
    beta: d.beta,
    h3: d.h3,
    h4: d.h4,
    log2h4h3: d.log2h4h3,
  }));
};

class LocusTraitPage extends React.Component {
  state = {
    qtlTabsValue: 'heatmap',
    gwasTabsValue: 'heatmap',
    credSet95Value: 'all',
    log2h4h3SliderValue: 1, // equivalent to H4 being double H3; suggested by Ed
    h4SliderValue: 0.95, // 95% default; suggested by Ed
    credibleSetIntersectionKeys: [],
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
  handleLog2h4h3SliderChange = (_, log2h4h3SliderValue) => {
    this.setState({ log2h4h3SliderValue });
  };
  handleH4SliderChange = (_, h4SliderValue) => {
    this.setState({ h4SliderValue });
  };
  handleCredibleSetIntersectionKeysCheckboxClick = key => event => {
    const { credibleSetIntersectionKeys } = this.state;
    if (event.target.checked) {
      this.setState({
        credibleSetIntersectionKeys: [key, ...credibleSetIntersectionKeys],
      });
    } else {
      this.setState({
        credibleSetIntersectionKeys: credibleSetIntersectionKeys.filter(
          d => d !== key
        ),
      });
    }
  };
  componentDidMount() {
    const { match } = this.props;
    const { studyId, indexVariantId } = match.params;
    this.setState({
      credibleSetIntersectionKeys: [
        `gwasCredibleSet__${studyId}__${indexVariantId}`,
      ],
    });
  }
  componentDidUpdate(prevProps) {
    // page changed
    const { match } = this.props;
    const { studyId, indexVariantId } = match.params;
    if (
      prevProps.match.params.studyId !== studyId ||
      prevProps.match.params.indexVariantId !== indexVariantId
    ) {
      this.setState({
        credibleSetIntersectionKeys: [
          `gwasCredibleSet__${studyId}__${indexVariantId}`,
        ],
      });
    }
  }
  render() {
    const { credSet95Value } = this.state;
    const { match } = this.props;
    const { studyId, indexVariantId } = match.params;

    const [chromosome, positionStr] = indexVariantId.split('_');
    const position = parseInt(positionStr);
    const start = position - HALF_WINDOW;
    const end = position + HALF_WINDOW;

    return (
      <BasePage>
        <Query
          query={STUDY_LOCUS_PAGE_QUERY}
          variables={{
            studyId,
            variantId: indexVariantId,
            chromosome,
            start,
            end,
          }}
        >
          {({ loading, error, data }) => {
            if (loading || error) {
              return null;
            }

            const {
              studyInfo,
              variantInfo,
              gwasColocalisation,
              qtlColocalisation,
              // gwasColocalisationForRegion,
              pageCredibleSet,
              pageSummary,
              genes,
              studyLocus2GeneTable,
            } = data;

            const maxQTLLog2h4h3 = d3.max(qtlColocalisation, d => d.log2h4h3);
            const maxGWASLog2h4h3 = d3.max(gwasColocalisation, d => d.log2h4h3);
            const maxLog2h4h3 = d3.max([maxQTLLog2h4h3, maxGWASLog2h4h3]);

            const shouldMakeColocalisationCredibleSetQuery =
              gwasColocalisation.length > 0 || qtlColocalisation.length > 0;
            const colocalisationCredibleSetQuery = shouldMakeColocalisationCredibleSetQuery
              ? gql(`
query CredibleSetsQuery {
  ${gwasColocalisation.map(gwasCredibleSetQueryAliasedFragment).join('')}
  ${qtlColocalisation.map(qtlCredibleSetQueryAliasedFragment).join('')}
}
            `)
              : null;

            const gwasColocalisationFiltered = gwasColocalisation
              .filter(d => d.log2h4h3 >= this.state.log2h4h3SliderValue)
              .filter(d => d.h4 >= this.state.h4SliderValue)
              .sort(log2h4h3Comparator)
              .reverse();

            const qtlColocalisationFiltered = qtlColocalisation
              .filter(d => d.log2h4h3 >= this.state.log2h4h3SliderValue)
              .filter(d => d.h4 >= this.state.h4SliderValue)
              .sort(log2h4h3Comparator)
              .reverse();

            const associationSummary = pageSummary;

            const pageCredibleSetAdjusted = pageCredibleSet
              .map(flattenPosition)
              .filter(
                d => (credSet95Value === '95' ? d.is95CredibleSet : true)
              );
            const pageCredibleSetKey = `gwasCredibleSet__${studyId}__${indexVariantId}`;
            const qtlColocDownloadData = getDownloadData(qtlColocalisation);

            return (
              <React.Fragment>
                <Helmet>
                  <title>{`(${
                    studyInfo.traitReported
                  }, ${indexVariantId})`}</title>
                </Helmet>
                <Grid container justify="space-between">
                  <Grid item>
                    <Typography variant="h4" color="textSecondary">
                      {`${studyInfo.traitReported}`}
                    </Typography>
                    <Typography variant="subtitle1">
                      {studyInfo.pubAuthor}{' '}
                      {studyInfo.pubDate
                        ? `(${new Date(studyInfo.pubDate).getFullYear()})`
                        : null}{' '}
                      {studyInfo.pubJournal ? (
                        <em>{studyInfo.pubJournal}</em>
                      ) : null}
                      {studyId ? (
                        <React.Fragment>
                          {' '}
                          <Link to={`/study/${studyId}`}>{studyId}</Link>
                        </React.Fragment>
                      ) : null}
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                      Locus around{' '}
                      <Link to={`/variant/${indexVariantId}`}>
                        {indexVariantId}
                      </Link>
                      {variantInfo.rsId ? ` (${variantInfo.rsId})` : null}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <LocusLink
                      big
                      chromosome={chromosome}
                      position={position}
                      selectedStudies={[studyId]}
                      selectedIndexVariants={[indexVariantId]}
                    >
                      View locus
                    </LocusLink>
                  </Grid>
                </Grid>

                <SectionHeading heading="Association summary" />

                <Typography variant="subtitle2">
                  <strong>P-value:</strong>{' '}
                  {significantFigures(associationSummary.pvalMantissa) +
                    'e' +
                    associationSummary.pvalExponent}
                </Typography>

                {associationSummary.beta ? (
                  <>
                    <Typography variant="subtitle2">
                      <strong>Beta:</strong>{' '}
                      {significantFigures(associationSummary.beta)}
                    </Typography>

                    <Typography variant="subtitle2">
                      <strong>Beta 95% Confidence Interval:</strong> (
                      {significantFigures(associationSummary.betaCILower)},{' '}
                      {significantFigures(associationSummary.betaCIUpper)})
                    </Typography>
                  </>
                ) : associationSummary.oddsRatio ? (
                  <>
                    <Typography variant="subtitle2">
                      <strong>Odds ratio:</strong>{' '}
                      {significantFigures(associationSummary.oddsRatio)}
                    </Typography>

                    <Typography variant="subtitle2">
                      <strong>Odds ratio Confidence Interval:</strong> (
                      {significantFigures(associationSummary.oddsRatioCILower)},{' '}
                      {significantFigures(associationSummary.oddsRatioCIUpper)})
                    </Typography>
                  </>
                ) : (
                  <Typography variant="subtitle2">
                    <strong>Beta:</strong> N/A
                  </Typography>
                )}

                <SectionHeading
                  heading="Gene prioritisation using locus-to-gene pipeline"
                  subheading="Which genes were prioritised by L2G pipeline at this locus?"
                />
                <ColocL2GTable
                  loading={false}
                  error={false}
                  data={studyLocus2GeneTable.rows}
                  handleToggleRegional={this.handleToggleRegional}
                  fileStem={`l2g-assignment-${studyId}-${indexVariantId}`}
                />

                <SectionHeading
                  heading="Gene prioritisation using colocalisation analysis"
                  subheading={
                    <React.Fragment>
                      Which molecular traits colocalise with{' '}
                      <strong>{traitAuthorYear(studyInfo)}</strong> at this
                      locus?
                    </React.Fragment>
                  }
                />
                <DataDownloader
                  tableHeaders={tableColumns}
                  rows={qtlColocDownloadData}
                  fileStem={`qtl-coloc-${studyId}-${indexVariantId}`}
                />

                <Tabs
                  variant="scrollable"
                  value={this.state.qtlTabsValue}
                  onChange={this.handleQtlTabsChange}
                >
                  <Tab label="Heatmap" value="heatmap" />
                  <Tab label="Table" value="table" />
                </Tabs>
                {this.state.qtlTabsValue === 'heatmap' ? (
                  <ColocQTLGeneTissueTable
                    loading={false}
                    error={false}
                    data={qtlColocalisation}
                    fileStem="qtl-coloc-heatmap"
                  />
                ) : null}
                {this.state.qtlTabsValue === 'table' ? (
                  <ColocQTLTable
                    loading={false}
                    error={false}
                    data={qtlColocalisation}
                    tableColumns={tableColumns}
                  />
                ) : null}

                <SectionHeading
                  heading={<div id="coloc">GWAS Study Colocalisation</div>}
                  subheading={
                    <React.Fragment>
                      Which GWAS studies colocalise with{' '}
                      <strong>{traitAuthorYear(studyInfo)}</strong> at this
                      locus?
                    </React.Fragment>
                  }
                />
                <ColocGWASTable
                  loading={false}
                  error={false}
                  data={gwasColocalisation}
                  handleToggleRegional={this.handleToggleRegional}
                  fileStem={`gwas-coloc-${studyId}-${indexVariantId}`}
                />
                {/* <Tabs
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
                    data={gwasColocalisationForRegion}
                  />
                ) : null}
                {this.state.gwasTabsValue === 'table' ? (
                  <ColocGWASTable
                    loading={false}
                    error={false}
                    data={gwasColocalisation}
                    handleToggleRegional={this.handleToggleRegional}
                  />
                ) : null} */}

                <SectionHeading
                  heading={`Credible Set Overlap`}
                  subheading={`Which variants at this locus are most likely causal?`}
                />
                <PlotContainer
                  center={
                    <Typography>
                      Showing credible sets for{' '}
                      <strong>{traitAuthorYear(studyInfo)}</strong> and GWAS
                      studies/QTLs in colocalisation. Expand the section to see
                      the underlying regional plot.
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
                              label="PP > 0.1%"
                            />
                          </RadioGroup>
                        </div>
                      </Grid>
                      <Grid item>
                        <Slider
                          label={`log2(H4/H3): ${significantFigures(
                            this.state.log2h4h3SliderValue
                          )}`}
                          min={0}
                          max={Math.ceil(maxLog2h4h3)}
                          step={Math.ceil(maxLog2h4h3) / 50}
                          value={this.state.log2h4h3SliderValue}
                          onChange={this.handleLog2h4h3SliderChange}
                        />
                      </Grid>
                      <Grid item>
                        <Slider
                          label={`H4: ${significantFigures(
                            this.state.h4SliderValue
                          )}`}
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
                  checkboxProps={{
                    checked:
                      this.state.credibleSetIntersectionKeys.indexOf(
                        pageCredibleSetKey
                      ) >= 0,
                    onChange: this.handleCredibleSetIntersectionKeysCheckboxClick(
                      pageCredibleSetKey
                    ),
                    value: pageCredibleSetKey,
                  }}
                  credibleSetProps={{
                    label: traitAuthorYear(studyInfo),
                    start,
                    end,
                    data: pageCredibleSetAdjusted,
                  }}
                  regionalProps={{
                    title: null,
                    query: GWAS_REGIONAL_QUERY,
                    variables: {
                      studyId: studyInfo.studyId,
                      chromosome,
                      start,
                      end,
                    },
                    start,
                    end,
                  }}
                />

                {shouldMakeColocalisationCredibleSetQuery ? (
                  <Query query={colocalisationCredibleSetQuery} variables={{}}>
                    {({ loading: loading2, error: error2, data: data2 }) => {
                      if (loading2 || error2) {
                        return null;
                      }

                      // de-alias
                      const gwasColocalisationCredibleSetsFiltered = gwasColocalisationFiltered.map(
                        ({ study, indexVariant, ...rest }) => ({
                          key: `gwasCredibleSet__${study.studyId}__${
                            indexVariant.id
                          }`,
                          study,
                          indexVariant,
                          credibleSet: data2[
                            `gwasCredibleSet__${study.studyId}__${
                              indexVariant.id
                            }`
                          ]
                            .map(flattenPosition)
                            .filter(
                              d =>
                                credSet95Value === '95'
                                  ? d.is95CredibleSet
                                  : true
                            ),
                          ...rest,
                        })
                      );
                      const qtlColocalisationCredibleSetsFiltered = qtlColocalisationFiltered.map(
                        ({
                          qtlStudyName,
                          phenotypeId,
                          tissue,
                          indexVariant,
                          ...rest
                        }) => ({
                          key: `qtlCredibleSet__${qtlStudyName}__${phenotypeId}__${
                            tissue.id
                          }__${indexVariant.id}`,
                          qtlStudyName,
                          phenotypeId,
                          tissue,
                          indexVariant,
                          credibleSet: data2[
                            `qtlCredibleSet__${qtlStudyName}__${phenotypeId}__${
                              tissue.id
                            }__${indexVariant.id}`
                          ]
                            .map(flattenPosition)
                            .filter(
                              d =>
                                credSet95Value === '95'
                                  ? d.is95CredibleSet
                                  : true
                            ),
                          ...rest,
                        })
                      );

                      // get the intersecting variants
                      const credibleSetsAll = [
                        {
                          key: pageCredibleSetKey,
                          credibleSet: pageCredibleSetAdjusted,
                        },
                        ...gwasColocalisationCredibleSetsFiltered.map(
                          ({ key, credibleSet }) => ({ key, credibleSet })
                        ),
                        ...qtlColocalisationCredibleSetsFiltered.map(
                          ({ key, credibleSet }) => ({ key, credibleSet })
                        ),
                      ];
                      const { credibleSetIntersectionKeys } = this.state;
                      const credibleSetsChecked = credibleSetsAll.filter(
                        d => credibleSetIntersectionKeys.indexOf(d.key) >= 0
                      );
                      const variantsByCredibleSets = credibleSetsChecked.map(
                        d =>
                          d.credibleSet.map(({ tagVariant, ...rest }) => ({
                            statsFields: rest,
                            ...tagVariant,
                          }))
                      );
                      const variantIdsInCredibleSetsIntersection = variantsByCredibleSets.reduce(
                        (acc, vs, i) => {
                          vs.forEach(v => {
                            const { statsFields, ...variantFields } = v;
                            if (acc[v.id]) {
                              acc[v.id].posteriorProbabilityProd *=
                                statsFields.posteriorProbability;
                              acc[v.id].posteriorProbabilityMax = Math.max(
                                acc[v.id].posteriorProbabilityMax,
                                statsFields.posteriorProbability
                              );
                              acc[v.id].appearsInCount += 1;
                            } else {
                              acc[v.id] = {
                                ...variantFields,
                                posteriorProbabilityMax:
                                  statsFields.posteriorProbability,
                                posteriorProbabilityProd:
                                  statsFields.posteriorProbability,
                                appearsInCount: 1,
                              };
                            }
                          });
                          return acc;
                        },
                        {}
                      );
                      const variantsByCredibleSetsIntersection = Object.values(
                        variantIdsInCredibleSetsIntersection
                      )
                        .filter(
                          v =>
                            v.appearsInCount === variantsByCredibleSets.length
                        )
                        .map(v => ({
                          ...v,
                          posteriorProbability: v.posteriorProbabilityProd, // aliased for colouring on plot
                        }));

                      return (
                        <React.Fragment>
                          <Typography style={{ paddingTop: '10px' }}>
                            <strong>GWAS</strong>
                          </Typography>
                          {gwasColocalisationCredibleSetsFiltered.length > 0 ? (
                            gwasColocalisationCredibleSetsFiltered.map(d => {
                              return (
                                <CredibleSetWithRegional
                                  key={d.key}
                                  checkboxProps={{
                                    checked:
                                      this.state.credibleSetIntersectionKeys.indexOf(
                                        d.key
                                      ) >= 0,
                                    onChange: this.handleCredibleSetIntersectionKeysCheckboxClick(
                                      d.key
                                    ),
                                    value: d.key,
                                  }}
                                  credibleSetProps={{
                                    label: traitAuthorYear(d.study),
                                    start,
                                    end,
                                    h4: d.h4,
                                    logH4H3: d.log2h4h3,
                                    data: d.credibleSet,
                                  }}
                                  regionalProps={{
                                    title: null,
                                    query: GWAS_REGIONAL_QUERY,
                                    variables: {
                                      studyId: d.study.studyId,
                                      chromosome,
                                      start,
                                      end,
                                    },
                                    start,
                                    end,
                                  }}
                                />
                              );
                            })
                          ) : (
                            <Typography align="center">
                              No GWAS studies satisfying the applied filters.
                            </Typography>
                          )}

                          <Typography style={{ paddingTop: '10px' }}>
                            <strong>QTL</strong>
                          </Typography>
                          {qtlColocalisationCredibleSetsFiltered.length > 0 ? (
                            qtlColocalisationCredibleSetsFiltered.map(d => {
                              return (
                                <CredibleSetWithRegional
                                  key={d.key}
                                  checkboxProps={{
                                    checked:
                                      this.state.credibleSetIntersectionKeys.indexOf(
                                        d.key
                                      ) >= 0,
                                    onChange: this.handleCredibleSetIntersectionKeysCheckboxClick(
                                      d.key
                                    ),
                                    value: d.key,
                                  }}
                                  credibleSetProps={{
                                    label: `${d.qtlStudyName}: ${
                                      d.gene.symbol
                                    } in ${d.tissue.name}`,
                                    start,
                                    end,
                                    h4: d.h4,
                                    logH4H3: d.log2h4h3,
                                    data: d.credibleSet,
                                  }}
                                  regionalProps={{
                                    title: null,
                                    query: QTL_REGIONAL_QUERY,
                                    variables: {
                                      studyId: d.qtlStudyName,
                                      phenotypeId: d.phenotypeId,
                                      bioFeature: d.tissue.id,
                                      chromosome,
                                      start,
                                      end,
                                    },
                                    start,
                                    end,
                                  }}
                                />
                              );
                            })
                          ) : (
                            <Typography align="center">
                              No QTL studies satisfying the applied filters.
                            </Typography>
                          )}

                          <Typography style={{ paddingTop: '10px' }}>
                            <strong>
                              Intersection of credible set variants
                            </strong>
                          </Typography>
                          <PlotContainer>
                            <PlotContainerSection>
                              <div style={{ paddingRight: '32px' }}>
                                <CredibleSet
                                  label="Intersection Variants"
                                  start={start}
                                  end={end}
                                  data={variantsByCredibleSetsIntersection}
                                />
                              </div>
                            </PlotContainerSection>
                          </PlotContainer>
                          <CredibleSetsIntersectionTable
                            data={variantsByCredibleSetsIntersection}
                            filenameStem={`${studyId}-${indexVariantId}-credset-intersection`}
                          />
                        </React.Fragment>
                      );
                    }}
                  </Query>
                ) : null}

                <Typography style={{ paddingTop: '10px' }}>
                  <strong>Genes</strong>
                </Typography>
                <PlotContainer>
                  <PlotContainerSection>
                    <div style={{ paddingRight: '32px' }}>
                      <GeneTrack
                        data={{ genes: flatExonsToPairedExons(genes) }}
                        start={start}
                        end={end}
                      />
                    </div>
                  </PlotContainerSection>
                </PlotContainer>
              </React.Fragment>
            );
          }}
        </Query>
      </BasePage>
    );
  }
}

export default LocusTraitPage;
