import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, Heading, SubHeading, DownloadSVGPlot } from 'ot-ui';
import { PheWAS } from 'ot-charts';

import BasePage from './BasePage';
import AssociatedGenesTable from '../components/AssociatedGenesTable';
import PheWASTable, { tableColumns } from '../components/PheWASTable';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';
import ScrollToTop from '../components/ScrollToTop';
import withTooltip from '../components/withTooltip';

const PheWASWithTooltip = withTooltip(PheWAS, tableColumns);

function hasAssociatedGenes(data) {
  return (
    data &&
    data.genesForVariant &&
    data.genesForVariant.genes &&
    data.genesForVariant.genes.length > 0
  );
}

function hasAssociations(data) {
  return (
    data &&
    data.pheWAS &&
    data.pheWAS.associations &&
    data.pheWAS.associations.length > 0
  );
}

function hasAssociatedIndexVariants(data) {
  return (
    data.indexVariantsAndStudiesForTagVariant &&
    data.indexVariantsAndStudiesForTagVariant.associations &&
    data.indexVariantsAndStudiesForTagVariant.associations.length > 0
  );
}

function transformAssociatedIndexVariants(data) {
  const associationsFlattened = data.associations.map(d => {
    const { indexVariant, study, ...rest } = d;
    return {
      indexVariantId: indexVariant.id,
      indexVariantRsId: indexVariant.rsId,
      studyId: study.studyId,
      traitReported: study.traitReported,
      pmid: study.pmid,
      pubDate: study.pubDate,
      pubAuthor: study.pubAuthor,
      ...rest,
    };
  });
  return {
    associations: associationsFlattened,
  };
}

function hasAssociatedTagVariants(data) {
  return (
    data.tagVariantsAndStudiesForIndexVariant &&
    data.tagVariantsAndStudiesForIndexVariant.associations &&
    data.tagVariantsAndStudiesForIndexVariant.associations.length > 0
  );
}

function transformAssociatedTagVariants(data) {
  const associationsFlattened = data.associations.map(d => {
    const { tagVariant, study, ...rest } = d;
    return {
      tagVariantId: tagVariant.id,
      tagVariantRsId: tagVariant.rsId,
      studyId: study.studyId,
      traitReported: study.traitReported,
      pmid: study.pmid,
      pubDate: study.pubDate,
      pubAuthor: study.pubAuthor,
      ...rest,
    };
  });
  return {
    associations: associationsFlattened,
  };
}

const associatedGenesQuery = gql`
  query GenesForVariantQuery($variantId: String!) {
    genesForVariant(variantId: $variantId) {
      genes {
        id
        symbol
        overallScore
      }
    }
  }
`;

const pheWASQuery = gql`
  query PheWASQuery($variantId: String!) {
    pheWAS(variantId: $variantId) {
      associations {
        studyId
        traitReported
        traitCode
        pval
        beta
        oddsRatio
        nTotal
        nCases
      }
    }
  }
`;

const associatedIndexesQuery = gql`
  query AssociatedIndexVariantsQuery($variantId: String!) {
    indexVariantsAndStudiesForTagVariant(variantId: $variantId) {
      associations {
        indexVariant {
          id
          rsId
        }
        study {
          studyId
          traitReported
          pmid
          pubDate
          pubAuthor
        }
        pval
        nTotal
        overallR2
        posteriorProbability
      }
    }
  }
`;

const associatedTagsQuery = gql`
  query AssociatedTagVariantsQuery($variantId: String!) {
    tagVariantsAndStudiesForIndexVariant(variantId: $variantId) {
      associations {
        tagVariant {
          id
          rsId
        }
        study {
          studyId
          traitReported
          pmid
          pubDate
          pubAuthor
        }
        pval
        nTotal
        overallR2
        posteriorProbability
      }
    }
  }
`;

const VariantPage = ({ match }) => {
  let pheWASPlot = React.createRef();
  const { variantId } = match.params;

  return (
    <BasePage>
      <ScrollToTop onRouteChange />
      <Helmet>
        <title>{variantId}</title>
      </Helmet>
      <PageTitle>{`Variant ${variantId}`}</PageTitle>
      <hr />
      <Heading>Assigned genes</Heading>
      <SubHeading>
        Which genes are functionally implicated by this variant?
      </SubHeading>
      <Query query={associatedGenesQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          return hasAssociatedGenes(data) ? (
            <AssociatedGenesTable
              data={data.genesForVariant.genes}
              filenameStem={`${variantId}-assigned-genes`}
            />
          ) : null;
        }}
      </Query>

      <Query query={pheWASQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          return hasAssociations(data) ? (
            <Fragment>
              <hr />
              <Heading>PheWAS</Heading>
              <SubHeading>
                Which traits are associated with this variant in UK Biobank?
              </SubHeading>
              <DownloadSVGPlot
                svgContainer={pheWASPlot}
                filenameStem={`${variantId}-traits`}
              >
                <PheWASWithTooltip
                  associations={data.pheWAS.associations}
                  ref={pheWASPlot}
                />
              </DownloadSVGPlot>
              <PheWASTable associations={data.pheWAS.associations} />
            </Fragment>
          ) : null;
        }}
      </Query>

      <Query query={associatedIndexesQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          return hasAssociatedIndexVariants(data) ? (
            <Fragment>
              <hr />
              <Heading>GWAS lead variants</Heading>
              <SubHeading>
                Which GWAS lead variants are linked with this variant?
              </SubHeading>
              <AssociatedIndexVariantsTable
                data={
                  transformAssociatedIndexVariants(
                    data.indexVariantsAndStudiesForTagVariant
                  ).associations
                }
                variantId={variantId}
                filenameStem={`${variantId}-lead-variants`}
              />
            </Fragment>
          ) : null;
        }}
      </Query>

      <Query query={associatedTagsQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          return hasAssociatedTagVariants(data) ? (
            <Fragment>
              <hr />
              <Heading>Tag variants</Heading>
              <SubHeading>
                Which variants tag (through LD or finemapping) this lead
                variant?
              </SubHeading>
              <AssociatedTagVariantsTable
                data={
                  transformAssociatedTagVariants(
                    data.tagVariantsAndStudiesForIndexVariant
                  ).associations
                }
                variantId={variantId}
                filenameStem={`${variantId}-tag-variants`}
              />
            </Fragment>
          ) : null;
        }}
      </Query>
    </BasePage>
  );
};

export default VariantPage;
