import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Splash, HomeBox, SearchExamples } from 'ot-ui';

import Search from '../components/Search';

const EXAMPLES = [
  { label: 'CDK6', url: '/gene/ENSG00000105810' },
  { label: '1_100314838_C_T', url: '/variant/1_100314838_C_T' },
  { label: 'Blood protein levels (Sun BB; 2018)', url: '/study/GCST005806' },
];

const searchQuery = gql`
  query SearchQuery($queryString: String) {
    search(queryString: $queryString) {
      genes {
        id
        symbol
        name
        synonyms
      }
      variants {
        variantId
        rsId
      }
      studies {
        studyId
        reportedTrait
        pubAuthor
        pubDate
        pubJournal
      }
    }
  }
`;

const HomePage = () => (
  <div>
    <Helmet>
      <title>Open Targets Genetics</title>
    </Helmet>
    <Splash />
    <HomeBox name="Genetics">
      <Search />
      <SearchExamples examples={EXAMPLES} />
      <p>
        This platform uses GRCh37 from the{' '}
        <a href="https://www.ncbi.nlm.nih.gov/grc">
          Genome Reference Consortium
        </a>
      </p>
    </HomeBox>
    <Query
      query={searchQuery}
      variables={{ queryString: 'braf' }}
      fetchPolicy="network-only"
    >
      {({ loading, error, data }) => {
        return null;
      }}
    </Query>
  </div>
);

export default HomePage;
