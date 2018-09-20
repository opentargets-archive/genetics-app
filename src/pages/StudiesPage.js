import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import queryString from 'query-string';
import gql from 'graphql-tag';

import { PageTitle, SectionHeading } from 'ot-ui';

import BasePage from './BasePage';
import ScrollToTop from '../components/ScrollToTop';
import ManhattansTable from '../components/ManhattansTable';
import StudySearch from '../components/StudySearch';

const studyInfoPrefix = 'studyInfo';
const studyInfo = studyId => `
studyInfo(studyId: "${studyId}") {
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
  return studyIds
    .filter(
      d => data[`${studyInfoPrefix}${d}`] && data[`${manhattanPrefix}${d}`]
    )
    .map(d => ({
      ...data[`${studyInfoPrefix}${d}`],
      ...data[`${manhattanPrefix}${d}`],
      associationsCount: data[`${manhattanPrefix}${d}`].associations.length,
    }));
};

class StudiesPage extends React.Component {
  handleAddStudy = studyId => {
    const { studyIds, ...rest } = this._parseQueryProps();
    const newStudyIds = studyIds
      ? [studyId, ...studyIds.filter(d => d !== studyId)]
      : [studyId];
    const newQueryParams = { ...rest };
    if (studyIds) {
      newQueryParams.studyIds = newStudyIds;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleDeleteStudy = studyId => () => {
    const { studyIds, ...rest } = this._parseQueryProps();
    const newStudyIds = studyIds ? studyIds.filter(d => d !== studyId) : null;
    const newQueryParams = { ...rest };
    if (studyIds) {
      newQueryParams.studyIds = newStudyIds;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  render() {
    const { studyIds } = this._parseQueryProps();
    return (
      <BasePage>
        <ScrollToTop onRouteChange />
        <Helmet>
          <title>Compare studies</title>
        </Helmet>
        <PageTitle>Compare studies</PageTitle>
        <div style={{ maxWidth: '400px' }}>
          <StudySearch handleAddStudy={this.handleAddStudy} />
        </div>

        <Query query={manhattansQuery(studyIds)} fetchPolicy="network-only">
          {({ loading, error, data }) => {
            if (hasData(data)) {
              const studies = transformData(studyIds, data);
              return (
                <React.Fragment>
                  <SectionHeading
                    heading={`Independently-associated loci across ${
                      studies.length
                    } studies`}
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
                  <ManhattansTable
                    studies={studies}
                    onDeleteStudy={this.handleDeleteStudy}
                  />
                </React.Fragment>
              );
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
