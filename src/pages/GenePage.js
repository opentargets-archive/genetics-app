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

function hasGeneData(data, geneId) {
  return (
    data &&
    data.search &&
    data.search.genes &&
    data.search.genes.length === 1 &&
    data.search.genes[0].id === geneId
  );
}

function geneData(data) {
  return data.search.genes[0];
}

function hasAssociatedStudies(data) {
  return data && data.studiesForGene;
}

const GenePage = ({ match }) => {
  const { geneId } = match.params;
  return (
    <BasePage>
      <Query query={SEARCH_QUERY} variables={{ geneId }}>
        {({ loading, error, data }) => {
          const isValidGene = hasGeneData(data, geneId);
          const gene = isValidGene ? geneData(data) : {};
          const associatedStudies =
            isValidGene && hasAssociatedStudies(data)
              ? data.studiesForGene.map(d => d.study)
              : [];

          const { chromosome, start, end, symbol } = gene;
          return (
            <React.Fragment>
              <Helmet>
                <title>{symbol}</title>
              </Helmet>
              <PageTitle>
                {symbol} <span style={{ fontSize: '0.8rem' }}>{geneId}</span>
              </PageTitle>
              <SubHeading
                left={
                  isValidGene
                    ? `${chromosome}:${commaSeparate(start)}-${commaSeparate(
                        end
                      )} `
                    : null
                }
              />
              <SubHeading
                left={
                  isValidGene ? (
                    <LocusLink
                      chromosome={chromosome}
                      position={Math.round((start + end) / 2)}
                      selectedGenes={[geneId]}
                    >
                      View locus
                    </LocusLink>
                  ) : null
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
                loading={loading}
                error={error}
                data={associatedStudies}
                geneId={geneId}
                chromosome={chromosome}
                position={Math.round((start + end) / 2)}
              />
            </React.Fragment>
          );
        }}
      </Query>
    </BasePage>
  );
};

export default GenePage;
