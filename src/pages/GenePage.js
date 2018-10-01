import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, SubHeading, SectionHeading, commaSeparate } from 'ot-ui';

import BasePage from './BasePage';
import LocusLink from '../components/LocusLink';
import AssociatedStudiesTable from '../components/AssociatedStudiesTable';

const SEARCH_QUERY = gql`
  query GenePageQuery($geneId: String!) {
    search(queryString: $geneId) {
      genes {
        id
        symbol
        chromosome
        start
        end
      }
    }
    studiesForGene(geneId: $geneId) {
      study {
        studyId
        traitReported
        pubAuthor
        pubDate
        pmid
        nInitial
        nReplication
        nCases
      }
    }
  }
`;

const GenePage = ({ match }) => {
  const { geneId } = match.params;
  return (
    <BasePage>
      <Query query={SEARCH_QUERY} variables={{ geneId }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <span>Fetching gene location and redirecting...</span>;
          } else if (
            data &&
            data.search &&
            data.search.genes &&
            data.search.genes.length === 1 &&
            data.studiesForGene
          ) {
            const { chromosome, start, end, symbol } = data.search.genes[0];
            const position = Math.floor((start + end) / 2);
            return (
              <React.Fragment>
                <Helmet>
                  <title>{symbol}</title>
                </Helmet>
                <PageTitle>{symbol}</PageTitle>
                <SubHeading
                  left={`${chromosome}:${commaSeparate(start)}-${commaSeparate(
                    end
                  )} `}
                />

                <SubHeading
                  left={
                    <LocusLink
                      chromosome={chromosome}
                      position={position}
                      selectedGenes={[geneId]}
                    >
                      View locus
                    </LocusLink>
                  }
                />
                <SectionHeading heading="Useful links" />
                <SubHeading
                  left={
                    <Fragment>
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
                    </Fragment>
                  }
                />
                <SectionHeading
                  heading={`Associated studies`}
                  subheading={`Which studies are associated with ${symbol}?`}
                  entities={[
                    {
                      type: 'study',
                      fixed: false,
                    },
                    {
                      type: 'gene',
                      fixed: true,
                    },
                  ]}
                />
                <AssociatedStudiesTable
                  data={data.studiesForGene.map(d => d.study)}
                  geneId={geneId}
                  chromosome={chromosome}
                  position={Math.round((start + end) / 2)}
                />
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
