import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
import _ from 'lodash';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import { DownloadSVGPlot, SectionHeading, ListTooltip, Button } from 'ot-ui';
import { PheWAS, withTooltip } from 'ot-charts';

import BasePage from './BasePage';
import PheWASTable, { tableColumns } from '../components/PheWASTable';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';
import AssociatedGenes from '../components/AssociatedGenes';
import ScrollToTop from '../components/ScrollToTop';
import LocusLink from '../components/LocusLink';
import transformGenesForVariantsSchema from '../logic/transformGenesForVariantSchema';
import PlotContainer from 'ot-ui/build/components/PlotContainer';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

function hasInfo(data) {
  return data && data.variantInfo;
}
function hasAssociatedGenes(data) {
  return data && data.genesForVariantSchema;
}
function hasAssociations(data) {
  return (
    data &&
    data.pheWAS &&
    data.pheWAS.associations &&
    data.pheWAS.associations.length > 0
  );
}
function hasAssociatedIndexVariants(data) {
  return (
    data &&
    data.indexVariantsAndStudiesForTagVariant &&
    data.indexVariantsAndStudiesForTagVariant.associations &&
    data.indexVariantsAndStudiesForTagVariant.associations.length > 0
  );
}
function hasAssociatedTagVariants(data) {
  return (
    data &&
    data.tagVariantsAndStudiesForIndexVariant &&
    data.tagVariantsAndStudiesForIndexVariant.associations &&
    data.tagVariantsAndStudiesForIndexVariant.associations.length > 0
  );
}

function transformVariantInfo(data) {
  return data.variantInfo;
}
function transformPheWAS(data) {
  return data.pheWAS.associations.map(d => {
    const { study, ...rest } = d;
    const { studyId, traitReported, traitCategory } = study;
    return {
      studyId,
      traitReported,
      traitCategory,
      ...rest,
    };
  });
}
function transformAssociatedIndexVariants(data) {
  const associationsFlattened = data.indexVariantsAndStudiesForTagVariant.associations.map(
    d => {
      const { indexVariant, study, ...rest } = d;
      return {
        indexVariantId: indexVariant.id,
        indexVariantRsId: indexVariant.rsId,
        studyId: study.studyId,
        traitReported: study.traitReported,
        pmid: study.pmid,
        pubDate: study.pubDate,
        pubAuthor: study.pubAuthor,
        ...rest,
      };
    }
  );
  return associationsFlattened;
}
function transformAssociatedTagVariants(data) {
  const associationsFlattened = data.tagVariantsAndStudiesForIndexVariant.associations.map(
    d => {
      const { tagVariant, study, ...rest } = d;
      return {
        tagVariantId: tagVariant.id,
        tagVariantRsId: tagVariant.rsId,
        studyId: study.studyId,
        traitReported: study.traitReported,
        pmid: study.pmid,
        pubDate: study.pubDate,
        pubAuthor: study.pubAuthor,
        ...rest,
      };
    }
  );
  return associationsFlattened;
}

const variantPageQuery = gql`
  query VariantPageQuery($variantId: String!) {
    variantInfo(variantId: $variantId) {
      rsId
      nearestGene {
        id
        symbol
      }
      nearestCodingGene {
        id
        symbol
      }
    }
    genesForVariantSchema {
      qtls {
        id
        sourceId
        tissues {
          id
          name
        }
      }
      intervals {
        id
        sourceId
        tissues {
          id
          name
        }
      }
      functionalPredictions {
        id
        sourceId
        tissues {
          id
          name
        }
      }
    }
    genesForVariant(variantId: $variantId) {
      gene {
        id
        symbol
      }
      overallScore
      qtls {
        sourceId
        aggregatedScore
        tissues {
          tissue {
            id
            name
          }
          quantile
          beta
          pval
        }
      }
      intervals {
        sourceId
        aggregatedScore
        tissues {
          tissue {
            id
            name
          }
          quantile
          score
        }
      }
      functionalPredictions {
        sourceId
        aggregatedScore
        tissues {
          tissue {
            id
            name
          }
          maxEffectLabel
          maxEffectScore
        }
      }
    }
    pheWAS(variantId: $variantId) {
      associations {
        study {
          studyId
          traitReported
          traitCode
          traitCategory
        }
        pval
        beta
        oddsRatio
        nTotal
        nCases: nCasesStudy
      }
    }
    indexVariantsAndStudiesForTagVariant(variantId: $variantId) {
      associations {
        indexVariant {
          id
          rsId
        }
        study {
          studyId
          traitReported
          pmid
          pubDate
          pubAuthor
        }
        pval
        nTotal
        overallR2
        posteriorProbability
      }
    }
    tagVariantsAndStudiesForIndexVariant(variantId: $variantId) {
      associations {
        tagVariant {
          id
          rsId
        }
        study {
          studyId
          traitReported
          pmid
          pubDate
          pubAuthor
        }
        pval
        nTotal
        overallR2
        posteriorProbability
      }
    }
  }
`;

const styles = theme => {
  return {
    header: {
      display: 'inline-block',
    },
    headerSection: {
      padding: theme.sectionPadding,
    },
    ensemblLink: {
      marginLeft: '5px',
      position: 'relative',
      bottom: '8px',
      textDecoration: 'none',
    },
  };
};

class VariantPage extends React.Component {
  handlePhewasTraitFilter = newPhewasTraitFilterValue => {
    const { phewasTraitFilter, ...rest } = this._parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (newPhewasTraitFilterValue && newPhewasTraitFilterValue.length > 0) {
      newQueryParams.phewasTraitFilter = newPhewasTraitFilterValue.map(
        d => d.value
      );
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handlePhewasCategoryFilter = newPhewasCategoryFilterValue => {
    const { phewasCategoryFilter, ...rest } = this._parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (
      newPhewasCategoryFilterValue &&
      newPhewasCategoryFilterValue.length > 0
    ) {
      newQueryParams.phewasCategoryFilter = newPhewasCategoryFilterValue.map(
        d => d.value
      );
    }
    this._stringifyQueryProps(newQueryParams);
  };
  _parseQueryProps() {
    const { history } = this.props;
    const queryProps = queryString.parse(history.location.search);

    // single values need to be put in lists
    if (queryProps.phewasTraitFilter) {
      queryProps.phewasTraitFilter = Array.isArray(queryProps.phewasTraitFilter)
        ? queryProps.phewasTraitFilter
        : [queryProps.phewasTraitFilter];
    }
    if (queryProps.phewasCategoryFilter) {
      queryProps.phewasCategoryFilter = Array.isArray(
        queryProps.phewasCategoryFilter
      )
        ? queryProps.phewasCategoryFilter
        : [queryProps.phewasCategoryFilter];
    }
    return queryProps;
  }
  _stringifyQueryProps(newQueryParams) {
    const { history } = this.props;
    history.replace({
      ...history.location,
      search: queryString.stringify(newQueryParams),
    });
  }
  render() {
    const { match, classes } = this.props;
    let pheWASPlot = React.createRef();
    const { variantId } = match.params;
    const [chromosome, positionString] = variantId.split('_');
    const position = parseInt(positionString, 10);
    const {
      phewasTraitFilter: phewasTraitFilterUrl,
      phewasCategoryFilter: phewasCategoryFilterUrl,
    } = this._parseQueryProps();
    return (
      <BasePage>
        <ScrollToTop onRouteChange />
        <Helmet>
          <title>{variantId}</title>
        </Helmet>
        <Query query={variantPageQuery} variables={{ variantId }}>
          {({ loading, error, data }) => {
            const isVariantWithInfo = hasInfo(data);
            const isGeneVariant = hasAssociatedGenes(data);
            const isPheWASVariant = hasAssociations(data);
            const isTagVariant = hasAssociatedIndexVariants(data);
            const isIndexVariant = hasAssociatedTagVariants(data);

            const PheWASWithTooltip = withTooltip(
              PheWAS,
              ListTooltip,
              tableColumns({
                variantId,
                chromosome,
                position,
                isIndexVariant,
                isTagVariant,
              }),
              'phewas'
            );

            const variantInfo = isVariantWithInfo
              ? transformVariantInfo(data)
              : {};
            const pheWASAssociations = isPheWASVariant
              ? transformPheWAS(data)
              : [];
            const associatedIndexVariants = isTagVariant
              ? transformAssociatedIndexVariants(data)
              : [];
            const associatedTagVariants = isIndexVariant
              ? transformAssociatedTagVariants(data)
              : [];

            // phewas - filtered
            const pheWASAssociationsFiltered = pheWASAssociations.filter(d => {
              return (
                (phewasTraitFilterUrl
                  ? phewasTraitFilterUrl.indexOf(d.traitReported) >= 0
                  : true) &&
                (phewasCategoryFilterUrl
                  ? phewasCategoryFilterUrl.indexOf(d.traitCategory) >= 0
                  : true)
              );
            });
            // phewas - filters
            const phewasTraitFilterOptions = _.sortBy(
              _.uniq(pheWASAssociationsFiltered.map(d => d.traitReported)).map(
                d => ({
                  label: d,
                  value: d,
                  selected: phewasTraitFilterUrl
                    ? phewasTraitFilterUrl.indexOf(d) >= 0
                    : false,
                })
              ),
              [d => !d.selected, 'value']
            );
            const phewasTraitFilterValue = phewasTraitFilterOptions.filter(
              d => d.selected
            );
            const phewasCategoryFilterOptions = _.sortBy(
              _.uniq(pheWASAssociationsFiltered.map(d => d.traitCategory)).map(
                d => ({
                  label: d,
                  value: d,
                  selected: phewasCategoryFilterUrl
                    ? phewasCategoryFilterUrl.indexOf(d) >= 0
                    : false,
                })
              ),
              [d => !d.selected, 'value']
            );
            const phewasCategoryFilterValue = phewasCategoryFilterOptions.filter(
              d => d.selected
            );

            return (
              <Fragment>
                <Paper className={classes.headerSection}>
                  <Grid container>
                    <Grid item>
                      <Typography className={classes.header} variant="display1">
                        {variantId}
                      </Typography>{' '}
                      <Typography
                        className={classes.header}
                        variant="title"
                        color="textSecondary"
                      >
                        {variantInfo.rsId}
                      </Typography>
                      <a
                        className={classes.ensemblLink}
                        href={`http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?v=${
                          variantInfo.rsId
                        }`}
                      >
                        <Button variant="outlined">Ensembl</Button>
                      </a>
                    </Grid>
                  </Grid>
                  <Grid container justify="space-between">
                    <Grid item>
                      {isIndexVariant || isTagVariant ? (
                        <LocusLink
                          chromosome={chromosome}
                          position={position}
                          selectedIndexVariants={
                            isIndexVariant ? [variantId] : null
                          }
                          selectedTagVariants={
                            isTagVariant && !isIndexVariant ? [variantId] : null
                          }
                        >
                          View locus
                        </LocusLink>
                      ) : null}
                    </Grid>
                    <Grid item>
                      <Typography variant="subheading">
                        {variantInfo.nearestGene ? (
                          <Fragment>
                            Nearest Gene:{' '}
                            <Link to={`/gene/${variantInfo.nearestGene.id}`}>
                              {variantInfo.nearestGene.symbol}
                            </Link>
                          </Fragment>
                        ) : null}
                        {variantInfo.nearestGene &&
                        variantInfo.nearestCodingGene
                          ? ', '
                          : null}
                        {variantInfo.nearestCodingGene ? (
                          <Fragment>
                            Nearest Protein-Coding Gene:{' '}
                            <Link
                              to={`/gene/${variantInfo.nearestCodingGene.id}`}
                            >
                              {variantInfo.nearestCodingGene.symbol}
                            </Link>
                          </Fragment>
                        ) : null}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                <SectionHeading
                  heading="Assigned genes"
                  subheading="Which genes are functionally implicated by this variant?"
                  entities={[
                    {
                      type: 'variant',
                      fixed: true,
                    },
                    {
                      type: 'gene',
                      fixed: false,
                    },
                  ]}
                />
                {isGeneVariant ? (
                  <AssociatedGenes
                    genesForVariantSchema={transformGenesForVariantsSchema(
                      data.genesForVariantSchema
                    )}
                    genesForVariant={data.genesForVariant}
                  />
                ) : (
                  <PlotContainer
                    loading={loading}
                    error={error}
                    center={
                      <Typography variant="subheading">
                        {loading ? '...' : '(no data)'}
                      </Typography>
                    }
                  />
                )}
                <SectionHeading
                  heading="PheWAS"
                  subheading="Which traits are associated with this variant in UK Biobank?"
                  entities={[
                    {
                      type: 'study',
                      fixed: false,
                    },
                    {
                      type: 'variant',
                      fixed: true,
                    },
                  ]}
                />
                {isPheWASVariant ? (
                  <DownloadSVGPlot
                    loading={loading}
                    error={error}
                    svgContainer={pheWASPlot}
                    filenameStem={`${variantId}-traits`}
                    reportDownloadEvent={() => {
                      reportAnalyticsEvent({
                        category: 'visualisation',
                        action: 'download',
                        label: `variant:phewas:svg`,
                      });
                    }}
                  >
                    <PheWASWithTooltip
                      associations={pheWASAssociationsFiltered}
                      ref={pheWASPlot}
                    />
                  </DownloadSVGPlot>
                ) : null}
                <PheWASTable
                  associations={pheWASAssociationsFiltered}
                  {...{
                    loading,
                    error,
                    variantId,
                    chromosome,
                    position,
                    isIndexVariant,
                    isTagVariant,
                  }}
                  traitFilterValue={phewasTraitFilterValue}
                  traitFilterOptions={phewasTraitFilterOptions}
                  traitFilterHandler={this.handlePhewasTraitFilter}
                  categoryFilterValue={phewasCategoryFilterValue}
                  categoryFilterOptions={phewasCategoryFilterOptions}
                  categoryFilterHandler={this.handlePhewasCategoryFilter}
                />
                <SectionHeading
                  heading="GWAS lead variants"
                  subheading="Which GWAS lead variants are linked with this variant?"
                  entities={[
                    {
                      type: 'study',
                      fixed: false,
                    },
                    {
                      type: 'indexVariant',
                      fixed: false,
                    },
                    {
                      type: 'tagVariant',
                      fixed: true,
                    },
                  ]}
                />
                <AssociatedIndexVariantsTable
                  loading={loading}
                  error={error}
                  data={associatedIndexVariants}
                  variantId={variantId}
                  filenameStem={`${variantId}-lead-variants`}
                />
                <SectionHeading
                  heading="Tag variants"
                  subheading="Which variants tag (through LD or finemapping) this lead variant?"
                  entities={[
                    {
                      type: 'study',
                      fixed: false,
                    },
                    {
                      type: 'indexVariant',
                      fixed: true,
                    },
                    {
                      type: 'tagVariant',
                      fixed: false,
                    },
                  ]}
                />
                <AssociatedTagVariantsTable
                  loading={loading}
                  error={error}
                  data={associatedTagVariants}
                  variantId={variantId}
                  filenameStem={`${variantId}-tag-variants`}
                />
              </Fragment>
            );
          }}
        </Query>
      </BasePage>
    );
  }
}

export default withStyles(styles)(VariantPage);
