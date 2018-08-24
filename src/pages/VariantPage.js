import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, Heading, SubHeading } from 'ot-ui';
import { PheWAS } from 'ot-charts';

import BasePage from './BasePage';
import AssociatedGenesTable from '../components/AssociatedGenesTable';
import PheWASTable, { tableColumns } from '../components/PheWASTable';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';
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
    data.indexVariantsAndStudiesForTagVariant.rows &&
    data.indexVariantsAndStudiesForTagVariant.rows.length > 0
  );
}

function hasAssociatedTagVariants(data) {
  return (
    data.tagVariantsAndStudiesForIndexVariant &&
    data.tagVariantsAndStudiesForIndexVariant.rows &&
    data.tagVariantsAndStudiesForIndexVariant.rows.length > 0
  );
}

const associatedGenesQuery = gql`
  {
    genesForVariant(variantId: "1_100314838_C_T") {
      genes {
        id
        symbol
        overallScore
      }
    }
  }
`;

const pheWASQuery = gql`
  {
    pheWAS(variantId: "1_100314838_C_T") {
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
  {
    indexVariantsAndStudiesForTagVariant(variantId: "1_100314838_C_T") {
      rows {
        indexVariantId
        indexVariantRsId
        studyId
        traitReported
        pval

        # publication info
        pmid
        pubDate
        pubAuthor
        nTotal

        # ld info is optional
        overallR2

        # finemapping is optional; but expect all or none of the following
        isInCredibleSet
      }
    }
  }
`;

const associatedTagsQuery = gql`
  {
    tagVariantsAndStudiesForIndexVariant(variantId: "1_100314838_C_T") {
      rows {
        tagVariantId
        tagVariantRsId
        studyId
        traitReported
        pval

        # publication info
        pmid
        pubDate
        pubAuthor
        nTotal

        # ld info is optional
        overallR2

        # finemapping is optional; but expect all or none of the following
        isInCredibleSet
        posteriorProbability
      }
    }
  }
`;

const VariantPage = ({ match }) => (
  <BasePage>
    <Helmet>
      <title>{match.params.variantId}</title>
    </Helmet>
    <PageTitle>{`Variant ${match.params.variantId}`}</PageTitle>
    <hr />
    <Heading>Assigned genes</Heading>
    <SubHeading>
      Which genes are functionally implicated by this variant?
    </SubHeading>
    <Query query={associatedGenesQuery}>
      {({ loading, error, data }) => {
        return hasAssociatedGenes(data) ? (
          <AssociatedGenesTable data={data.genesForVariant.genes} />
        ) : null;
      }}
    </Query>
    <hr />
    <Heading>PheWAS</Heading>
    <SubHeading>
      Which traits are associated with this variant in UK Biobank?
    </SubHeading>
    <Query query={pheWASQuery}>
      {({ loading, error, data }) => {
        return hasAssociations(data) ? (
          <Fragment>
            <PheWASWithTooltip associations={data.pheWAS.associations} />
            <PheWASTable associations={data.pheWAS.associations} />
          </Fragment>
        ) : null;
      }}
    </Query>
    <hr />
    <Heading>GWAS lead variants</Heading>
    <SubHeading>
      Which GWAS lead variants are linked with this variant?
    </SubHeading>
    <Query query={associatedIndexesQuery}>
      {({ loading, error, data }) => {
        return hasAssociatedIndexVariants(data) ? (
          <AssociatedIndexVariantsTable
            data={data.indexVariantsAndStudiesForTagVariant.rows}
          />
        ) : null;
      }}
    </Query>
    <hr />
    <Heading>Tag variants</Heading>
    <SubHeading>
      Which variants tag (through LD or finemapping) this lead variant?
    </SubHeading>
    <Query query={associatedTagsQuery}>
      {({ loading, error, data }) => {
        return hasAssociatedTagVariants(data) ? (
          <AssociatedTagVariantsTable
            data={data.tagVariantsAndStudiesForIndexVariant.rows}
          />
        ) : null;
      }}
    </Query>
  </BasePage>
);

export default VariantPage;
