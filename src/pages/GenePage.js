import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, Heading, SubHeading } from 'ot-ui';

import BasePage from './BasePage';
import LocusLink from '../components/LocusLink';

const SEARCH_QUERY = gql`
  query SearchQuery($queryString: String) {
    search(queryString: $queryString) {
      genes {
        id
        symbol
        chromosome
        start
        end
      }
    }
  }
`;

const GenePage = ({ match }) => {
  const { geneId } = match.params;
  return (
    <BasePage>
      <Query query={SEARCH_QUERY} variables={{ queryString: geneId }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <span>Fetching gene location and redirecting...</span>;
          } else if (
            data &&
            data.search &&
            data.search.genes &&
            data.search.genes.length === 1
          ) {
            const { chromosome, start, end, symbol } = data.search.genes[0];
            const position = Math.floor((start + end) / 2);
            return (
              <React.Fragment>
                <Helmet>
                  <title>{symbol}</title>
                </Helmet>
                <PageTitle>{symbol}</PageTitle>
                <SubHeading>
                  <LocusLink
                    chromosome={chromosome}
                    position={position}
                    selectedGenes={[geneId]}
                  >
                    View locus
                  </LocusLink>
                </SubHeading>
              </React.Fragment>
            );
          } else {
            return <span>Could not find gene.</span>;
          }
        }}
      </Query>
    </BasePage>
  );
};

export default GenePage;
