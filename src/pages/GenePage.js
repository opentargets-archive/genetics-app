import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import queryString from 'query-string';
import _ from 'lodash';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import LinkIcon from '@material-ui/icons/Link';
import Paper from '@material-ui/core/Paper';

import {
  SectionHeading,
  Button,
  Typography,
  OverviewIcon,
  DrugsIcon,
  MouseIcon,
  PathwaysIcon,
  ExpressionIcon,
  commaSeparate,
} from 'ot-ui';

import BasePage from './BasePage';
import LocusLink from '../components/LocusLink';
import AssociatedStudiesTable from '../components/AssociatedStudiesTable';
import GENE_PAGE_QUERY from '../queries/GenePageQuery.gql';

function hasGeneData(data, geneId) {
  return (
    data &&
    data.search &&
    data.search.genes &&
    data.search.genes.length === 1 &&
    data.search.genes[0].id === geneId
  );
}

function geneData(data) {
  return data.search.genes[0];
}

function hasAssociatedStudies(data) {
  return data && data.studiesForGene;
}

const styles = theme => {
  return {
    section: {
      height: '100%',
      padding: theme.sectionPadding,
    },
    geneSymbol: {
      display: 'inline-block',
    },
    locusLinkButton: {
      width: '248px',
      height: '60px',
    },
    locusIcon: {
      fill: 'white',
      width: '40px',
      height: '40px',
    },
    link: {
      textDecoration: 'none',
    },
    geneInfoItem: {
      width: '20%',
    },
    platformLink: {
      textAlign: 'center',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    iconLink: {
      '&:hover': {
        fill: theme.palette.primary.dark,
      },
    },
  };
};

class GenePage extends React.Component {
  handleTraitFilter = newTraitFilterValue => {
    const { traitFilter, ...rest } = this._parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (newTraitFilterValue && newTraitFilterValue.length > 0) {
      newQueryParams.traitFilter = newTraitFilterValue.map(d => d.value);
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleAuthorFilter = newFilterValue => {
    const { authorFilter, ...rest } = this._parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (newFilterValue && newFilterValue.length > 0) {
      newQueryParams.authorFilter = newFilterValue.map(d => d.value);
    }
    this._stringifyQueryProps(newQueryParams);
  };
  _parseQueryProps() {
    const { history } = this.props;
    const queryProps = queryString.parse(history.location.search);

    // single values need to be put in lists
    if (queryProps.traitFilter) {
      queryProps.traitFilter = Array.isArray(queryProps.traitFilter)
        ? queryProps.traitFilter
        : [queryProps.traitFilter];
    }
    if (queryProps.authorFilter) {
      queryProps.authorFilter = Array.isArray(queryProps.authorFilter)
        ? queryProps.authorFilter
        : [queryProps.authorFilter];
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
    const { geneId } = match.params;
    const {
      traitFilter: traitFilterUrl,
      authorFilter: authorFilterUrl,
    } = this._parseQueryProps();
    const locusLinkClasses = {
      button: classes.locusLinkButton,
    };
    return (
      <BasePage>
        <Query query={GENE_PAGE_QUERY} variables={{ geneId }}>
          {({ loading, error, data }) => {
            const isValidGene = hasGeneData(data, geneId);
            const gene = isValidGene ? geneData(data) : {};

            // all
            const associatedStudies =
              isValidGene && hasAssociatedStudies(data)
                ? data.studiesForGene.map(d => d.study)
                : [];

            // filtered
            const associatedStudiesFiltered = associatedStudies.filter(d => {
              return (
                (traitFilterUrl
                  ? traitFilterUrl.indexOf(d.traitReported) >= 0
                  : true) &&
                (authorFilterUrl
                  ? authorFilterUrl.indexOf(d.pubAuthor) >= 0
                  : true)
              );
            });

            // filters
            const traitFilterOptions = _.sortBy(
              _.uniq(associatedStudiesFiltered.map(d => d.traitReported)).map(
                d => ({
                  label: d,
                  value: d,
                  selected: traitFilterUrl
                    ? traitFilterUrl.indexOf(d) >= 0
                    : false,
                })
              ),
              [d => !d.selected, 'value']
            );
            const traitFilterValue = traitFilterOptions.filter(d => d.selected);
            const authorFilterOptions = _.sortBy(
              _.uniq(associatedStudiesFiltered.map(d => d.pubAuthor)).map(
                d => ({
                  label: d,
                  value: d,
                  selected: authorFilterUrl
                    ? authorFilterUrl.indexOf(d) >= 0
                    : false,
                })
              ),
              [d => !d.selected, 'value']
            );
            const authorFilterValue = authorFilterOptions.filter(
              d => d.selected
            );

            const { chromosome, start, end, symbol, bioType } = gene;
            return (
              <React.Fragment>
                <Helmet>
                  <title>{symbol}</title>
                </Helmet>
                <Grid container style={{ marginBottom: '10px' }}>
                  <Grid item xs={12} sm={12} md={12}>
                    <Paper className={classes.section}>
                      <Grid container justify="space-between">
                        <Grid item>
                          <Typography
                            className={classes.geneSymbol}
                            variant="h4"
                            color="textSecondary"
                          >
                            {symbol}
                          </Typography>
                          <Typography variant="subtitle1">
                            {chromosome}:{commaSeparate(start)}-
                            {commaSeparate(end)}
                          </Typography>
                        </Grid>
                        {isValidGene ? (
                          <Grid item>
                            <LocusLink
                              big
                              chromosome={chromosome}
                              position={Math.round((start + end) / 2)}
                              selectedGenes={[geneId]}
                            />
                          </Grid>
                        ) : null}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
                <Grid container justify="space-between" spacing={8}>
                  <Grid item sm={12} md={8}>
                    <Paper className={classes.section}>
                      <Typography variant="subtitle1">
                        Information about {symbol} from the Open Targets
                        Platform
                      </Typography>
                      <Grid container justify="space-around">
                        <Grid item className={classes.geneInfoItem}>
                          <a
                            className={classes.platformLink}
                            href={`https://www.targetvalidation.org/target/${geneId}`}
                            target="_blank"
                          >
                            <OverviewIcon className={classes.iconLink} />
                            <Typography>Target profile overview</Typography>
                          </a>
                        </Grid>
                        <Grid item className={classes.geneInfoItem}>
                          <a
                            className={classes.platformLink}
                            href={`https://www.targetvalidation.org/target/${geneId}?view=sec:known_drug`}
                            target="_blank"
                          >
                            <DrugsIcon className={classes.iconLink} />
                            <Typography>Is there known drug data?</Typography>
                          </a>
                        </Grid>
                        <Grid item className={classes.geneInfoItem}>
                          <a
                            className={classes.platformLink}
                            href={`https://www.targetvalidation.org/target/${geneId}?view=sec:mouse_phenotypes`}
                            target="_blank"
                          >
                            <MouseIcon className={classes.iconLink} />
                            <Typography>
                              Is there mouse phenotype data?
                            </Typography>
                          </a>
                        </Grid>
                        <Grid item className={classes.geneInfoItem}>
                          <a
                            className={classes.platformLink}
                            href={`https://www.targetvalidation.org/target/${geneId}?view=sec:affected_pathway`}
                            target="_blank"
                          >
                            <PathwaysIcon className={classes.iconLink} />
                            <Typography>Is there pathway data?</Typography>
                          </a>
                        </Grid>
                        <Grid item className={classes.geneInfoItem}>
                          <a
                            className={classes.platformLink}
                            href={`https://www.targetvalidation.org/target/${geneId}?view=sec:expression`}
                            target="_blank"
                          >
                            <ExpressionIcon className={classes.iconLink} />
                            <Typography>Is there expression data?</Typography>
                          </a>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item sm={12} md={4}>
                    <Paper className={classes.section}>
                      <Grid container>
                        <Grid item>
                          <Typography>Other links</Typography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={8}>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://grch37.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">
                              Ensembl <LinkIcon />
                            </Button>
                          </a>
                        </Grid>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://www.genecards.org/cgi-bin/carddisp.pl?gene=${symbol}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">
                              Gene Cards <LinkIcon />
                            </Button>
                          </a>
                        </Grid>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://gtexportal.org/home/eqtls/byGene?geneId=${symbol}&tissueName=All`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">
                              GTEx <LinkIcon />
                            </Button>
                          </a>
                        </Grid>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://www.genenames.org/cgi-bin/search?search_type=all&search=${symbol}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">
                              HGNC <LinkIcon />
                            </Button>
                          </a>
                        </Grid>
                        {bioType === 'protein_coding' ? (
                          <Grid item>
                            <a
                              className={classes.link}
                              href={`https://www.uniprot.org/uniprot/?query=${symbol}&sort=score`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outlined">
                                UniProt <LinkIcon />
                              </Button>
                            </a>
                          </Grid>
                        ) : null}
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`http://gnomad.broadinstitute.org/gene/${geneId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">
                              gnomAD <LinkIcon />
                            </Button>
                          </a>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
                <SectionHeading
                  heading={`Associated studies`}
                  subheading={`Which studies are associated with ${symbol}?`}
                  entities={[
                    {
                      type: 'study',
                      fixed: false,
                    },
                    {
                      type: 'gene',
                      fixed: true,
                    },
                  ]}
                />
                <AssociatedStudiesTable
                  loading={loading}
                  error={error}
                  data={associatedStudiesFiltered}
                  geneId={geneId}
                  chromosome={chromosome}
                  position={Math.round((start + end) / 2)}
                  traitFilterValue={traitFilterValue}
                  traitFilterOptions={traitFilterOptions}
                  traitFilterHandler={this.handleTraitFilter}
                  authorFilterValue={authorFilterValue}
                  authorFilterOptions={authorFilterOptions}
                  authorFilterHandler={this.handleAuthorFilter}
                />
              </React.Fragment>
            );
          }}
        </Query>
      </BasePage>
    );
  }
}

export default withStyles(styles)(GenePage);
