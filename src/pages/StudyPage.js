import React from 'react';
import { Query } from 'react-apollo';
import { Helmet } from 'react-helmet';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';

import { SectionHeading } from 'ot-ui';

import BasePage from './BasePage';

import ScrollToTop from '../components/ScrollToTop';
import OverlapLink from '../components/OverlapLink';
import ManhattanContainer from '../components/ManhattanContainer';
import StudySummary from '../components/StudySummary';
import STUDY_PAGE_QUERY from '../queries/StudyPageQuery.gql';

function hasStudyInfo(data) {
  return data && data.studyInfo;
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
        <Query query={STUDY_PAGE_QUERY} variables={{ studyId }}>
          {({ loading, error, data }) => {
            const isStudyWithInfo = hasStudyInfo(data);
            const { pubAuthor, pubDate, pubJournal } = isStudyWithInfo
              ? data.studyInfo
              : {};
            return (
              <React.Fragment>
                <ScrollToTop />
                <Helmet>
                  <title>{studyId}</title>
                </Helmet>
                <Grid container justify="space-between">
                  <Grid item>
                    <Typography
                      className={classes.header}
                      variant="h4"
                      color="textSecondary"
                    >
                      {isStudyWithInfo ? data.studyInfo.traitReported : null}
                    </Typography>
                    <Typography variant="subtitle1">
                      {pubAuthor}{' '}
                      {pubDate ? `(${new Date(pubDate).getFullYear()})` : null}{' '}
                      {pubJournal ? <em>{pubJournal}</em> : null}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <OverlapLink big studyId={studyId} />
                  </Grid>
                </Grid>

                <SectionHeading
                  heading="Study summary"
                  entities={[
                    {
                      type: 'study',
                      fixed: true,
                    },
                  ]}
                />
                {isStudyWithInfo ? <StudySummary {...data.studyInfo} /> : null}
                <ManhattanContainer {...{ studyId, loading, error, data }} />
              </React.Fragment>
            );
          }}
        </Query>
      </BasePage>
    );
  }
}

export default withStyles(styles)(StudyPage);
