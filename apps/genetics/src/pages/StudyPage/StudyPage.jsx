import React from 'react';
import { Query } from '@apollo/client/react/components';
import { Helmet } from 'react-helmet';
import { useQuery } from '@apollo/client';

import BasePage from './../BasePage';
import ScrollToTop from '../../components/ScrollToTop';
import ManhattanContainer from '../../components/ManhattanContainer';
import NotFoundPage from '../NotFoundPage';

import Header from './Header';
import Summary from '../../sections/study/Summary';

import { studyHasInfo } from '../../utils';

import STUDY_PAGE_QUERY from '../../queries/StudyPageQuery.gql';
import STUDY_HEADER_QUERY from './StudyHeaderQuery.gql';

function StudyPage(props) {
  const { match } = props;
  const { studyId } = match.params;

  const { loading, data: headerData } = useQuery(STUDY_HEADER_QUERY, {
    variables: { studyId },
  });

  if (!studyId || (headerData && !headerData.studyInfo)) {
    return <NotFoundPage />;
  }

  return (
    <BasePage>
      <Header data={headerData} loading={loading} />
      <Summary studyId={studyId} />
      <Query query={STUDY_PAGE_QUERY} variables={{ studyId }}>
        {({ loading, error, data }) => {
          const isStudyWithInfo = studyHasInfo(data);
          const { hasSumstats } = isStudyWithInfo ? data.studyInfo : {};
          return (
            <React.Fragment>
              <ScrollToTop />
              <Helmet>
                <title>{studyId}</title>
              </Helmet>
              <ManhattanContainer
                {...{ studyId, hasSumstats, loading, error, data }}
              />
            </React.Fragment>
          );
        }}
      </Query>
    </BasePage>
  );
}

export default StudyPage;
