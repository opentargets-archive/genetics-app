import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import queryString from 'query-string';
import gql from 'graphql-tag';

import { PageTitle, SubHeading, DownloadSVGPlot, SectionHeading } from 'ot-ui';

import BasePage from './BasePage';
import ScrollToTop from '../components/ScrollToTop';
import ManhattansTable from '../components/ManhattansTable';

const studyInfoPrefix = 'studyInfo';
const studyInfo = studyId => `
studyInfo(studyId: "${studyId}") {
  studyId
  traitReported
  pubAuthor
  pubDate
  pubJournal
  pmid
}
`;

const manhattanPrefix = 'manhattan';
const manhattan = studyId => `
manhattan(studyId: "${studyId}") {
  associations {
    variantId
    variantRsId
    pval
    chromosome
    position
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
`;

const manhattansQuery = studyIds => gql`
  query StudiesPageQuery {
    ${studyIds.map(d => `${studyInfoPrefix}${d}:${studyInfo(d)}`).join(' ')}
    ${studyIds.map(d => `${manhattanPrefix}${d}:${manhattan(d)}`).join(' ')}
  }
`;

const hasData = data => {
  return data && Object.keys(data).length > 0;
};

const transformData = (studyIds, data) => {
  return studyIds.map(d => ({
    ...data[`${studyInfoPrefix}${d}`],
    ...data[`${manhattanPrefix}${d}`],
  }));
};

class StudiesPage extends React.Component {
  render() {
    const { studyIds } = this._parseQueryProps();
    return (
      <BasePage>
        <ScrollToTop onRouteChange />
        <Helmet>
          <title>Compare studies</title>
        </Helmet>
        <PageTitle>Compare studies</PageTitle>
        <Query query={manhattansQuery(studyIds)} fetchPolicy="network-only">
          {({ loading, error, data }) => {
            if (hasData(data)) {
              const studies = transformData(studyIds, data);
              return <ManhattansTable studies={studies} />;
            } else {
              return null;
            }
          }}
        </Query>
      </BasePage>
    );
  }
  _parseQueryProps() {
    const { history } = this.props;
    const queryProps = queryString.parse(history.location.search);

    // single values need to be put in lists
    if (queryProps.studyIds) {
      queryProps.studyIds = Array.isArray(queryProps.studyIds)
        ? queryProps.studyIds
        : [queryProps.studyIds];
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
}

export default StudiesPage;
