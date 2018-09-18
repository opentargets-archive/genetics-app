import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, SubHeading, SectionHeading, commaSeparate } from 'ot-ui';

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
                  {`${chromosome}:${commaSeparate(start)}-${commaSeparate(
                    end
                  )} `}
                </SubHeading>
                <SubHeading>
                  <LocusLink
                    chromosome={chromosome}
                    position={position}
                    selectedGenes={[geneId]}
                  >
                    View locus
                  </LocusLink>
                </SubHeading>
                <SectionHeading heading="Useful links" />
                <SubHeading>
                  <a
                    href={`https://www.targetvalidation.org/target/${geneId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Targets Platform
                  </a>
                  <br />
                  <a
                    href={`https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ensembl
                  </a>
                  <br />
                  <a
                    href={`https://gtexportal.org/home/eqtls/byGene?geneId=${symbol}&tissueName=All`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GTEx
                  </a>
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
