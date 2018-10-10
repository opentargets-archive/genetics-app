import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
import _ from 'lodash';

import {
  SectionHeading,
  Button,
  Typography,
  LocusIcon,
  OverviewIcon,
  DrugsIcon,
  MouseIcon,
  PathwaysIcon,
  ExpressionIcon,
} from 'ot-ui';

import BasePage from './BasePage';
import LocusLink from '../components/LocusLink';
import AssociatedStudiesTable from '../components/AssociatedStudiesTable';
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import LinkIcon from '@material-ui/icons/Link';

const SEARCH_QUERY = gql`
  query GenePageQuery($geneId: String!) {
    search(queryString: $geneId) {
      genes {
        id
        symbol
        chromosome
        start
        end
        bioType
      }
    }
    studiesForGene(geneId: $geneId) {
      study {
        studyId
        traitReported
        pubAuthor
        pubDate
        pmid
        nInitial
        nReplication
        nCases
      }
    }
  }
`;

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
    card: {
      height: '100%',
    },
    locusLinkButton: {
      width: '240px',
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
    platformLink: {
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
        <Query query={SEARCH_QUERY} variables={{ geneId }}>
          {({ loading, error, data }) => {
            const isValidGene = hasGeneData(data, geneId);
            const gene = isValidGene ? geneData(data) : {};

            // all
            const associatedStudies =
              isValidGene && hasAssociatedStudies(data)
                ? data.studiesForGene.map(d => d.study)
                : [];

            // filters
            const traitFilterOptions = _.sortBy(
              _.uniq(associatedStudies.map(d => d.traitReported)).map(d => ({
                label: d,
                value: d,
                selected: traitFilterUrl
                  ? traitFilterUrl.indexOf(d) >= 0
                  : false,
              })),
              [d => !d.selected, 'value']
            );
            const traitFilterValue = traitFilterOptions.filter(d => d.selected);
            const authorFilterOptions = _.sortBy(
              _.uniq(associatedStudies.map(d => d.pubAuthor)).map(d => ({
                label: d,
                value: d,
                selected: authorFilterUrl
                  ? authorFilterUrl.indexOf(d) >= 0
                  : false,
              })),
              [d => !d.selected, 'value']
            );
            const authorFilterValue = authorFilterOptions.filter(
              d => d.selected
            );

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

            const { chromosome, start, end, symbol } = gene;
            return (
              <React.Fragment>
                <Helmet>
                  <title>{symbol}</title>
                </Helmet>
                <Grid container style={{ marginBottom: '10px' }}>
                  <Grid item md={12}>
                    <Card>
                      <CardContent>
                        <Grid container justify="space-between">
                          <Grid item>
                            <Typography variant="display1">{symbol}</Typography>
                          </Grid>
                          {isValidGene ? (
                            <Grid item>
                              <LocusLink
                                chromosome={chromosome}
                                position={Math.round((start + end) / 2)}
                                selectedGenes={[geneId]}
                                classes={locusLinkClasses}
                              >
                                View associated variants and traits within Locus
                                View plot
                                <LocusIcon className={classes.locusIcon} />
                              </LocusLink>
                            </Grid>
                          ) : null}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Grid container justify="space-between" spacing={8}>
                  <Grid item md={8}>
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography variant="subheading">
                          Information about {symbol} from the Open Targets
                          Platform
                        </Typography>
                        <Grid container justify="space-around">
                          <Grid item>
                            <a
                              className={classes.platformLink}
                              href={`https://www.targetvalidation.org/target/${geneId}`}
                            >
                              <OverviewIcon className={classes.iconLink} />
                              <Typography>Target profile overview</Typography>
                            </a>
                          </Grid>
                          <Grid item>
                            <a
                              className={classes.platformLink}
                              href={`https://www.targetvalidation.org/target/${geneId}?view=sec:known_drug`}
                            >
                              <DrugsIcon className={classes.iconLink} />
                              <Typography>Is there known drug data?</Typography>
                            </a>
                          </Grid>
                          <Grid item>
                            <a
                              className={classes.platformLink}
                              href={`https://www.targetvalidation.org/target/${geneId}?view=sec:mouse_phenotypes`}
                            >
                              <MouseIcon className={classes.iconLink} />
                              <Typography>
                                Is there mouse phenotype data?
                              </Typography>
                            </a>
                          </Grid>
                          <Grid item>
                            <a
                              className={classes.platformLink}
                              href={`https://www.targetvalidation.org/target/${geneId}?view=sec:affected_pathway`}
                            >
                              <PathwaysIcon className={classes.iconLink} />
                              <Typography>Is there pathway data?</Typography>
                            </a>
                          </Grid>
                          <Grid item>
                            <a
                              className={classes.platformLink}
                              href={`https://www.targetvalidation.org/target/${geneId}?view=sec:expression`}
                            >
                              <ExpressionIcon className={classes.iconLink} />
                              <Typography>Is there expression data?</Typography>
                            </a>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item md={4}>
                    <Card className={classes.card}>
                      <CardContent>
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
                              href={`http://exac.broadinstitute.org/gene/${geneId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outlined">
                                ExAC <LinkIcon />
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
                        </Grid>
                      </CardContent>
                    </Card>
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
