import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';

import { SectionHeading, Button } from 'ot-ui';

import BasePage from './BasePage';
import ManhattanTable from '../components/ManhattanTable';
import ScrollToTop from '../components/ScrollToTop';
import StudyInfo from '../components/StudyInfo';
import StudySize from '../components/StudySize';
import STUDY_PAGE_QUERY from '../queries/StudyPageQuery.gql';

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

const styles = theme => ({
  section: {
    padding: theme.sectionPadding,
  },
});

class StudyPage extends React.Component {
  render() {
    const { classes, match } = this.props;
    const { studyId } = match.params;

    return (
      <BasePage>
        <ScrollToTop />
        <Helmet>
          <title>{studyId}</title>
        </Helmet>

        <Query
          query={STUDY_PAGE_QUERY}
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
                <ManhattanTable
                  loading={loading}
                  error={error}
                  data={manhattan.associations}
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
}

export default withStyles(styles)(StudyPage);
