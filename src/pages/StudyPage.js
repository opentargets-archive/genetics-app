import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';

import {
  DownloadSVGPlot,
  SectionHeading,
  Button,
  ListTooltip,
  MultiSelect,
} from 'ot-ui';
import { Manhattan, withTooltip, chromosomeNames } from 'ot-charts';

import BasePage from './BasePage';
import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import ScrollToTop from '../components/ScrollToTop';
import StudyInfo from '../components/StudyInfo';
import StudySize from '../components/StudySize';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

const SIGNIFICANCE = 5e-8;

function hasAssociations(data) {
  return (
    data &&
    data.manhattan &&
    data.manhattan.associations &&
    data.manhattan.associations.length > 0
  );
}

function transformAssociations(data) {
  return {
    associations: data.manhattan.associations.map(d => {
      const { variant, ...rest } = d;
      return {
        ...rest,
        indexVariantId: variant.id,
        indexVariantRsId: variant.rsId,
        chromosome: variant.chromosome,
        position: variant.position,
      };
    }),
  };
}

function hasStudyInfo(data) {
  return data && data.studyInfo;
}

function significantLoci(data) {
  return hasAssociations(data)
    ? data.manhattan.associations.filter(d => d.pval < SIGNIFICANCE).length
    : 0;
}

function loci(data) {
  return hasAssociations(data) ? data.manhattan.associations.length : 0;
}

const manhattanQuery = gql`
  query StudyPageQuery($studyId: String!) {
    studyInfo(studyId: $studyId) {
      studyId
      traitReported
      pubAuthor
      pubDate
      pubJournal
      pmid
      nInitial
      nReplication
      nCases
    }
    manhattan(studyId: $studyId) {
      associations {
        variant {
          id
          rsId
          chromosome
          position
        }
        pval
        credibleSetSize
        ldSetSize
        bestGenes {
          score
          gene {
            id
            symbol
          }
        }
      }
    }
  }
`;

const styles = theme => {
  return {
    section: {
      padding: theme.sectionPadding,
    },
  };
};

class StudyPage extends React.Component {
  state = {
    focusChromosome: '',
  };
  render() {
    const { classes, match } = this.props;
    const { studyId } = match.params;
    let manhattanPlot = React.createRef();
    const ManhattanWithTooltip = withTooltip(
      Manhattan,
      ListTooltip,
      tableColumns(studyId),
      'manhattan'
    );
    return (
      <BasePage>
        <ScrollToTop />
        <Helmet>
          <title>{studyId}</title>
        </Helmet>

        <Query
          query={manhattanQuery}
          variables={{ studyId }}
          fetchPolicy="network-only"
        >
          {({ loading, error, data }) => {
            const isStudyWithInfo = hasStudyInfo(data);
            const isAssociatedStudy = hasAssociations(data);
            const significantLociCount = significantLoci(data);
            const lociCount = loci(data);

            const manhattan = isAssociatedStudy
              ? transformAssociations(data)
              : { associations: [] };
            return (
              <Fragment>
                <Paper className={classes.section}>
                  <Typography variant="display1">
                    {isStudyWithInfo ? data.studyInfo.traitReported : null}
                  </Typography>
                  <Grid container justify="space-between">
                    <Grid item>
                      {isStudyWithInfo ? (
                        <Typography variant="subheading">
                          <StudyInfo studyInfo={data.studyInfo} />
                        </Typography>
                      ) : null}
                    </Grid>
                    <Grid item>
                      {isStudyWithInfo ? (
                        <Typography variant="subheading">
                          <StudySize studyInfo={data.studyInfo} />
                        </Typography>
                      ) : null}
                    </Grid>
                  </Grid>
                  <Link
                    to={`/study-comparison/${studyId}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button gradient>Compare to related studies</Button>
                  </Link>
                </Paper>

                <SectionHeading
                  heading="Independently-associated loci"
                  subheading={
                    !loading
                      ? `Found ${significantLociCount} loci with genome-wide
                    significance (p-value < 5e-8) out of ${lociCount}`
                      : null
                  }
                  entities={[
                    {
                      type: 'study',
                      fixed: true,
                    },
                    {
                      type: 'indexVariant',
                      fixed: false,
                    },
                  ]}
                />

                <DownloadSVGPlot
                  left={
                    <MultiSelect
                      value={this.state.focusChromosome}
                      options={[
                        { label: 'All chromosomes', value: '' },
                        ...chromosomeNames.map(d => ({
                          label: `Chromosome ${d}`,
                          value: d,
                        })),
                      ]}
                      handleChange={this.handleChange}
                    />
                  }
                  loading={loading}
                  error={error}
                  svgContainer={manhattanPlot}
                  filenameStem={`${studyId}-independently-associated-loci`}
                  reportDownloadEvent={() => {
                    reportAnalyticsEvent({
                      category: 'visualisation',
                      action: 'download',
                      label: `study:manhattan:svg`,
                    });
                  }}
                >
                  <ManhattanWithTooltip
                    data={manhattan}
                    focusChromosome={this.state.focusChromosome}
                    handleChromosomeClick={this.handleChromosomeClick}
                    ref={manhattanPlot}
                  />
                </DownloadSVGPlot>
                <ManhattanTable
                  loading={loading}
                  error={error}
                  data={
                    this.state.focusChromosome
                      ? manhattan.associations.filter(
                          d => d.chromosome === this.state.focusChromosome
                        )
                      : manhattan.associations
                  }
                  studyId={studyId}
                  filenameStem={`${studyId}-independently-associated-loci`}
                />
              </Fragment>
            );
          }}
        </Query>
      </BasePage>
    );
  }
  handleChange = event => {
    if (event.target.value) {
      reportAnalyticsEvent({
        category: 'visualisation',
        action: 'filter',
        label: `study:manhattan:chromosome`,
      });
    }
    this.setState({ focusChromosome: event.target.value });
  };
  handleChromosomeClick = chromosome => {
    if (chromosome) {
      reportAnalyticsEvent({
        category: 'visualisation',
        action: 'filter',
        label: `study:manhattan:chromosome`,
      });
      this.setState({ focusChromosome: chromosome });
    } else {
      this.setState({ focusChromosome: '' });
    }
  };
}

export default withStyles(styles)(StudyPage);
