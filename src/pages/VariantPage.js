import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import queryString from 'query-string';

import { SectionHeading, Typography, Button, commaSeparate } from 'ot-ui';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import BasePage from './BasePage';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';
import AssociatedGenes from '../components/AssociatedGenes';
import ScrollToTop from '../components/ScrollToTop';
import LocusLink from '../components/LocusLink';
import transformGenesForVariantsSchema from '../logic/transformGenesForVariantSchema';
import PlotContainer from 'ot-ui/build/components/PlotContainer';
import PheWASSection from '../components/PheWASSection';

import VARIANT_PAGE_QUERY from '../queries/VariantPageQuery.gql';
import GnomADTable from '../components/GnomADTable';

function hasInfo(data) {
  return data && data.variantInfo;
}
function hasAssociatedGenes(data) {
  return data && data.genesForVariantSchema;
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

const styles = theme => {
  return {
    header: {
      display: 'inline-block',
    },
    headerSection: {
      padding: theme.sectionPadding,
    },
    link: {
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
    const { variantId } = match.params;
    const [chromosome, positionString] = variantId.split('_');
    const position = parseInt(positionString, 10);
    const {
      phewasTraitFilter: phewasTraitFilterUrl,
      phewasCategoryFilter: phewasCategoryFilterUrl,
    } = this._parseQueryProps();
    return (
      <BasePage>
        <ScrollToTop />
        <Helmet>
          <title>{variantId}</title>
        </Helmet>
        <Query query={VARIANT_PAGE_QUERY} variables={{ variantId }}>
          {({ loading, error, data }) => {
            const isVariantWithInfo = hasInfo(data);
            const isGeneVariant = hasAssociatedGenes(data);
            const isTagVariant = hasAssociatedIndexVariants(data);
            const isIndexVariant = hasAssociatedTagVariants(data);

            const variantInfo = isVariantWithInfo
              ? transformVariantInfo(data)
              : {};
            const associatedIndexVariants = isTagVariant
              ? transformAssociatedIndexVariants(data)
              : [];
            const associatedTagVariants = isIndexVariant
              ? transformAssociatedTagVariants(data)
              : [];

            return (
              <Fragment>
                <Paper className={classes.headerSection}>
                  <Grid container>
                    <Grid item>
                      <Typography
                        className={classes.header}
                        variant="h4"
                        color="textSecondary"
                      >
                        {variantId}
                      </Typography>{' '}
                      <Typography
                        className={classes.header}
                        variant="h6"
                        color="textSecondary"
                      >
                        {variantInfo.rsId}
                      </Typography>
                      <a
                        className={classes.link}
                        href={`http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?v=${
                          variantInfo.rsId
                        }`}
                        target="_blank"
                      >
                        <Button variant="outlined">Ensembl</Button>
                      </a>
                      <a
                        className={classes.link}
                        href={`http://gnomad.broadinstitute.org/variant/${variantId.replace(
                          /_/g,
                          '-'
                        )}`}
                        target="_blank"
                      >
                        <Button variant="outlined">gnomAD</Button>
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
                      <Typography variant="subtitle1">
                        {variantInfo.nearestGene ? (
                          <Fragment>
                            Nearest Gene (
                            {commaSeparate(variantInfo.nearestGeneDistance)} bp
                            away):{' '}
                            <Link to={`/gene/${variantInfo.nearestGene.id}`}>
                              {variantInfo.nearestGene.symbol}
                            </Link>
                          </Fragment>
                        ) : null}
                        {variantInfo.nearestGene &&
                        variantInfo.nearestCodingGene ? (
                          <br />
                        ) : null}
                        {variantInfo.nearestCodingGene ? (
                          <Fragment>
                            Nearest Protein-Coding Gene (
                            {commaSeparate(
                              variantInfo.nearestCodingGeneDistance
                            )}{' '}
                            bp away):{' '}
                            <Link
                              to={`/gene/${variantInfo.nearestCodingGene.id}`}
                            >
                              {variantInfo.nearestCodingGene.symbol}
                            </Link>
                          </Fragment>
                        ) : null}
                        {(variantInfo.nearestGene ||
                          variantInfo.nearestCodingGene) &&
                        variantInfo.mostSevereConsequence ? (
                          <br />
                        ) : null}
                        {variantInfo.mostSevereConsequence ? (
                          <Fragment>
                            Most Severe VEP Consequence:{' '}
                            <strong>
                              {variantInfo.mostSevereConsequence.replace(
                                /_/g,
                                ' '
                              )}
                            </strong>
                          </Fragment>
                        ) : null}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                <SectionHeading heading="Variant summary" />
                {isVariantWithInfo ? <GnomADTable data={variantInfo} /> : null}
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
                      <Typography variant="subtitle1">
                        {loading ? '...' : '(no data)'}
                      </Typography>
                    }
                  />
                )}
                <PheWASSection
                  variantId={variantId}
                  phewasTraitFilterUrl={phewasTraitFilterUrl}
                  phewasCategoryFilterUrl={phewasCategoryFilterUrl}
                  handlePhewasTraitFilter={this.handlePhewasTraitFilter}
                  handlePhewasCategoryFilter={this.handlePhewasCategoryFilter}
                  isIndexVariant={isIndexVariant}
                  isTagVariant={isTagVariant}
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
                  subheading="Which variants tag (through LD or fine-mapping) this lead variant?"
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
