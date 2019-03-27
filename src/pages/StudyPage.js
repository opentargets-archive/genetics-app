import React from 'react';
import { withApollo } from 'react-apollo';
import { Helmet } from 'react-helmet';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';

import { Manhattan, chromosomesWithCumulativeLengths } from 'ot-charts';
import { SectionHeading, DownloadSVGPlot, ListTooltip } from 'ot-ui';

import BasePage from './BasePage';
import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import ScrollToTop from '../components/ScrollToTop';
import OverlapLink from '../components/OverlapLink';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';
import STUDY_PAGE_QUERY from '../queries/StudyPageQuery.gql';
import StudySummary from '../components/StudySummary';

const SIGNIFICANCE = 5e-8;
const maxPos =
  chromosomesWithCumulativeLengths[chromosomesWithCumulativeLengths.length - 1]
    .cumulativeLength;

function hasAssociations(data) {
  return (
    data &&
    data.manhattan &&
    data.manhattan.associations &&
    data.manhattan.associations.length > 0
  );
}

function transformAssociations(data) {
  // TODO: API should fix this
  const zeroPvals = data.manhattan.associations.filter(d => d.pval === 0);
  if (zeroPvals.length > 0) {
    console.error('Found zero pvalues in Manhattan data: ', zeroPvals);
  }

  return data.manhattan.associations.filter(d => d.pval > 0).map(d => {
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
    start: 0,
    end: maxPos,
  };

  manhattanPlot = React.createRef();

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

  handleZoom = (start, end) => {
    this.setState({ start, end });
  };

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
      start,
      end,
    } = this.state;

    const { pubAuthor, pubDate, pubJournal } = isStudyWithInfo
      ? data.studyInfo
      : {};

    return (
      <BasePage>
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
          svgContainer={this.manhattanPlot}
          loading={loading}
          error={error}
          filenameStem={`${studyId}-independently-associated-loci`}
          reportDownloadEvent={() =>
            reportAnalyticsEvent({
              category: 'visualisation',
              action: 'download',
              label: `study:manhattan:svg`,
            })
          }
        >
          <Manhattan
            ref={this.manhattanPlot}
            associations={associations}
            tableColumns={tableColumns}
            studyId={studyId}
            onZoom={this.handleZoom}
            listTooltip={ListTooltip}
          />
        </DownloadSVGPlot>
        <ManhattanTable
          loading={loading}
          error={error}
          data={associations.filter(assoc => {
            return start <= assoc.globalPosition && assoc.globalPosition <= end;
          })}
          studyId={studyId}
          filenameStem={`${studyId}-independently-associated-loci`}
        />
      </BasePage>
    );
  }
}

export default withApollo(withStyles(styles)(StudyPage));
