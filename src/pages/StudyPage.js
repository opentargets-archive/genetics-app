import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, Heading, SubHeading } from 'ot-ui';
import { Manhattan } from 'ot-charts';

import BasePage from './BasePage';
import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import withTooltip from '../components/withTooltip';

const ManhattanWithTooltip = withTooltip(Manhattan, tableColumns);

function hasAssociations(data) {
  return (
    data.manhattan &&
    data.manhattan.associations &&
    data.manhattan.associations.length > 0
  );
}

const manhattanQuery = gql`
  {
    manhattan(studyId: "GCT123") {
      associations {
        indexVariantId
        indexVariantRsId
        pval
        chromosome
        position
        credibleSetSize
        ldSetSize
        bestGenes
      }
    }
  }
`;

const StudyPage = ({ match }) => (
  <BasePage>
    <Helmet>
      <title>{match.params.studyId}</title>
    </Helmet>
    <PageTitle>{`Study ${match.params.studyId}`}</PageTitle>
    <hr />
    <Heading>Associated loci</Heading>
    <SubHeading>Which loci are significantly linked to this study?</SubHeading>
    <Query query={manhattanQuery} fetchPolicy="network-only">
      {({ loading, error, data }) => {
        return hasAssociations(data) ? (
          <React.Fragment>
            <ManhattanWithTooltip data={data.manhattan} />
            <ManhattanTable data={data.manhattan.associations} />
          </React.Fragment>
        ) : null;
      }}
    </Query>
  </BasePage>
);

export default StudyPage;
