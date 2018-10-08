import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import {
  PageTitle,
  SubHeading,
  SectionHeading,
  commaSeparate,
  Button,
  Typography,
  DrugsIcon,
} from 'ot-ui';

import BasePage from './BasePage';
import LocusLink from '../components/LocusLink';
import AssociatedStudiesTable from '../components/AssociatedStudiesTable';
import { Grid } from '@material-ui/core';
import LaunchIcon from '@material-ui/icons/Launch';
import LocusIcon from '@material-ui/icons/MyLocation';
import MouseIcon from '@material-ui/icons/Pets';
import PathwaysIcon from '@material-ui/icons/Pets';
import ProfileIcon from '@material-ui/icons/Info';
import ExpressionIcon from '@material-ui/icons/Pets';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

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

const styles = () => {
  return {
    card: {
      height: '100%',
    },
    link: {
      textDecoration: 'none',
    },
  };
};

const GenePage = ({ match, classes }) => {
  const { geneId } = match.params;
  return (
    <BasePage>
      <Query query={SEARCH_QUERY} variables={{ geneId }}>
        {({ loading, error, data }) => {
          const isValidGene = hasGeneData(data, geneId);
          const gene = isValidGene ? geneData(data) : {};
          const associatedStudies =
            isValidGene && hasAssociatedStudies(data)
              ? data.studiesForGene.map(d => d.study)
              : [];

          const { chromosome, start, end, symbol } = gene;
          return (
            <React.Fragment>
              <Helmet>
                <title>{symbol}</title>
              </Helmet>
              <Grid container style={{ marginBottom: '10px' }}>
                <Grid item md="12">
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
                            >
                              View associated variants and traits within Locus
                              View plot
                            </LocusLink>
                          </Grid>
                        ) : null}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Grid container justify="space-between" spacing={8}>
                <Grid item md="8">
                  <Card className={classes.card}>
                    <CardContent>
                      <Typography>
                        Information about {symbol} from the Open Targets
                        Platform
                      </Typography>
                      <Grid container>
                        <Grid item>
                          <svg
                            version="1.1"
                            id="Layer_1"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            viewBox="0 0 320 279"
                          >
                            <g>
                              <g>
                                <path
                                  d="M267.6,207.2c-4.9-7.7-12.6-13-21.5-14.9c0,0,0,0,0,0h0c-0.5-0.1-1-0.2-1.5-0.3l5.8-10.7c4.9-8.9,4.1-19.9-1.9-28.1
			c-2.3-3.1-5.2-5.6-8.6-7.5l-2.1-1.1c-3.5-1.9-7.4-2.9-11.3-3V72.7h3.8c4.2,0,7.7-3.4,7.7-7.7V24.1c0-4.2-3.4-7.7-7.7-7.7H121.2
			c-0.1,0-0.2,0-0.3,0.1c-0.1,0-0.2-0.1-0.3-0.1H65.7c-4.2,0-7.7,3.4-7.7,7.7V65c0,4.2,3.4,7.7,7.7,7.7h3.8v162.5
			c0,13.7,11.1,24.8,24.8,24.8h97.7c0,0,0,0,0.1,0c0,0,0,0,0.1,0h0.3c0.3,0,0.5-0.1,0.7-0.1c2.1-0.1,4.3-0.3,6.4-0.9
			c5.8-1.7,10.6-5.4,14-10.2c4.7,5.3,10.9,9,18,10.5c0,0,0,0,0,0c0.3,0.1,0.6,0.1,0.9,0.1c0,0,0,0,0,0c2.1,0.4,4.3,0.7,6.4,0.7
			c16,0,30-11.3,33.4-27C274.2,224.1,272.5,214.9,267.6,207.2L267.6,207.2z M235.9,153c2.4,1.3,4.4,3,5.9,5.1
			c4.2,5.6,4.7,13.2,1.3,19.4l-7.8,14.3c-11.2,1.1-21.1,7.9-26.5,17.6c-1.3-0.6-2.7-1-4-1.8c-4.7-2.6-8.7-5.8-11.3-9.2
			c-2.1-2.8-2.8-5.3-1.9-6.8v0l17.6-32.4c2.3-4.2,6.1-7.3,10.8-8.7c4.6-1.4,9.5-0.9,13.8,1.4L235.9,153z M174.9,205.3H78V95.4h140.2
			v47c-0.2,0-0.3,0-0.5,0.1c-6.7,2-12.3,6.5-15.6,12.6L174.9,205.3z M200.4,24.6v39.9h-20.5V24.6H200.4z M171.7,64.5h-20.5l0-39.9
			h20.5L171.7,64.5z M143,64.5h-20.5V24.6H143L143,64.5L143,64.5z M114.3,64.5H93.8V24.6h20.5V64.5z M230.2,64.5h-21.6v-40l21.1-0.4
			L230.2,64.5z M65.7,24.6h19.9v39.9h-8.5c-0.6,0-1.1,0.2-1.6,0.3L66.2,65L65.7,24.6z M93.1,72.7h27.4c0.1,0,0.2,0,0.3-0.1
			c0.1,0,0.2,0.1,0.3,0.1h97.1v14.6H77.1l0-14.6H93.1z M77.6,235.2l-0.1-21.7h92.9l-3.6,6.6c-4.9,8.9-4.1,19.9,1.9,28.1
			c0.8,1.1,1.7,2.1,2.7,3.1c0,0,0,0,0,0c0.2,0.2,0.5,0.3,0.7,0.5h-78C85.1,251.8,77.6,244.4,77.6,235.2L77.6,235.2z M183.4,249.7
			l-2.1-1.1c-1.5-0.8-2.9-1.9-4.1-3c0,0,0,0,0,0c-0.7-0.6-1.3-1.4-1.8-2.1c-4.2-5.6-4.7-13.2-1.3-19.4l6.3-11.6
			c0.6-0.6,1.1-1.4,1.2-2.3l4.6-8.4c0.3,0.5,0.6,1,1,1.6c3.2,4.3,8.1,8.3,13.8,11.4c1.6,0.9,3.2,1.4,4.8,2.1c-0.1,0.5-0.4,1-0.5,1.6
			c-1.7,7.9-0.5,15.8,3.2,22.9l-0.6,1C203.2,251.1,192.2,254.4,183.4,249.7L183.4,249.7z M216.9,239.9c-3.8-5.8-5-12.8-3.5-19.6
			c2.5-11.6,12.9-20.2,25.4-20.5c0.5,0,1,0.1,1.5,0.2L229.4,250C224.2,248,219.9,244.6,216.9,239.9L216.9,239.9z M264.3,231.3
			c-2.7,12.4-14.6,20.9-26.9,20.4l10.9-50.1c5.1,2,9.5,5.4,12.5,10.1C264.5,217.5,265.8,224.5,264.3,231.3L264.3,231.3z"
                                />
                                <path
                                  d="M177.4,134.5H166v-11.4c0-4-3.2-7.2-7.2-7.2h-21.6c-4,0-7.2,3.2-7.2,7.2v11.4h-11.4c-4,0-7.2,3.2-7.2,7.2v21.6
			c0,4,3.2,7.2,7.2,7.2h11.4V182c0,4,3.2,7.2,7.2,7.2h21.6c4,0,7.2-3.2,7.2-7.2v-11.4h11.4c4,0,7.2-3.2,7.2-7.2v-21.6
			C184.6,137.7,181.4,134.5,177.4,134.5L177.4,134.5z M176.4,162.4h-14.6c-2.3,0-4.1,1.8-4.1,4.1V181h-19.7v-14.6
			c0-2.3-1.8-4.1-4.1-4.1h-14.6v-19.7H134c2.3,0,4.1-1.8,4.1-4.1V124h19.7v14.6c0,2.3,1.8,4.1,4.1,4.1h14.6L176.4,162.4z"
                                />
                              </g>
                            </g>
                          </svg>

                          <Typography>Target profile overview</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>Is there known drug data</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>
                            Is there mouse phenotype data?
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography>Is there pathway data?</Typography>
                        </Grid>
                        <Grid item>
                          <DrugsIcon />
                          <Typography>Is there expression data?</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item md="4">
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
                            href={`https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">Ensembl</Button>
                          </a>
                        </Grid>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">ExAC</Button>
                          </a>
                        </Grid>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">Gene Cards</Button>
                          </a>
                        </Grid>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://gtexportal.org/home/eqtls/byGene?geneId=${symbol}&tissueName=All`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">GTEx</Button>
                          </a>
                        </Grid>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://gtexportal.org/home/eqtls/byGene?geneId=${symbol}&tissueName=All`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">HGNC</Button>
                          </a>
                        </Grid>
                        <Grid item>
                          <a
                            className={classes.link}
                            href={`https://gtexportal.org/home/eqtls/byGene?geneId=${symbol}&tissueName=All`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined">UniProt</Button>
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
                data={associatedStudies}
                geneId={geneId}
                chromosome={chromosome}
                position={Math.round((start + end) / 2)}
              />
            </React.Fragment>
          );
        }}
      </Query>
    </BasePage>
  );
};

export default withStyles(styles)(GenePage);
