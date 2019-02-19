import React, { Fragment } from 'react';
import { withApollo } from 'react-apollo';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';

import { chromosomesWithCumulativeLengths } from 'ot-charts';
import { SectionHeading, Button } from 'ot-ui';

import BasePage from './BasePage';
import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import ScrollToTop from '../components/ScrollToTop';
import StudyInfo from '../components/StudyInfo';
import StudySize from '../components/StudySize';
import STUDY_PAGE_QUERY from '../queries/StudyPageQuery.gql';

import ManhattanPlot from '../components/ManhattanPlot';

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
  return data.manhattan.associations.map(d => {
    const { variant, ...rest } = d;
    const ch = chromosomesWithCumulativeLengths.find(
      ch => ch.name === variant.chromosome
    );

    return {
      ...rest,
      indexVariantId: variant.id,
      indexVariantRsId: variant.rsId,
      chromosome: variant.chromosome,
      position: variant.position,
      globalPosition: ch.cumulativeLength - ch.length + variant.position,
    };
  });
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

const styles = theme => ({
  section: {
    padding: theme.sectionPadding,
  },
});

class StudyPage extends React.Component {
  state = {
    loading: true,
    associations: [],
  };

  componentDidMount() {
    const { client, match } = this.props;
    const { studyId } = match.params;
    client
      .query({
        query: STUDY_PAGE_QUERY,
        variables: { studyId },
        fetchPolicy: 'network-only',
      })
      .then(({ data, error }) => {
        const isAssociatedStudy = hasAssociations(data);

        this.setState({
          loading: false,
          error,
          data,
          isStudyWithInfo: hasStudyInfo(data),
          isAssociatedStudy,
          significantLociCount: significantLoci(data),
          lociCount: loci(data),
          associations: isAssociatedStudy ? transformAssociations(data) : [],
        });
      });
  }

  render() {
    const { classes, match } = this.props;
    const { studyId } = match.params;
    const {
      loading,
      error,
      associations,
      isStudyWithInfo,
      data,
      significantLociCount,
      lociCount,
    } = this.state;

    return (
      <BasePage>
        <ScrollToTop />
        <Helmet>
          <title>{studyId}</title>
        </Helmet>

        <Fragment>
          <Paper className={classes.section}>
            <Typography variant="h4" color="textSecondary">
              {isStudyWithInfo ? data.studyInfo.traitReported : null}
            </Typography>
            <Grid container justify="space-between">
              <Grid item>
                {isStudyWithInfo ? (
                  <Typography variant="subtitle1">
                    <StudyInfo studyInfo={data.studyInfo} />
                  </Typography>
                ) : null}
              </Grid>
              <Grid item>
                {isStudyWithInfo ? (
                  <Typography variant="subtitle1">
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
          <ManhattanPlot
            associations={associations}
            tableColumns={tableColumns(studyId)}
          />
          <ManhattanTable
            loading={loading}
            error={error}
            data={associations}
            studyId={studyId}
            filenameStem={`${studyId}-independently-associated-loci`}
          />
        </Fragment>
      </BasePage>
    );
  }
}

export default withApollo(withStyles(styles)(StudyPage));
