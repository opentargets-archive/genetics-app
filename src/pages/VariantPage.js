import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PheWAS } from 'ot-charts';
import { PageTitle, Heading, SubHeading } from 'ot-ui';

import BasePage from './BasePage';
import PheWASTable from '../components/PheWASTable';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';

function hasAssociations(data) {
  return (
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

const pheWASQuery = gql`
  {
    pheWAS(variantId: "1_100314838_C_T") {
      associations {
        studyId
        traitReported
        traitCode
        pval
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
        pubJournal
        pubTitle
        pubAuthor
        nTotal
        nCases

        # ld info is optional
        overallR2

        # finemapping is optional; but expect all or none of the following
        log10Abf
        posteriorProbability
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
        pubJournal
        pubTitle
        pubAuthor
        nTotal
        nCases

        # ld info is optional
        overallR2

        # finemapping is optional; but expect all or none of the following
        log10Abf
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
    <Heading>Associated genes</Heading>
    <SubHeading>
      Which genes are functionally linked to this variant?
    </SubHeading>
    <table>
      <thead>
        <tr>
          <td>gene</td>
          <td>g2v score</td>
          <td>g2v evidence</td>
          <td />
          <td>...more columns to come</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Link to="/gene/ENSG0000001">CDK2</Link>
          </td>
          <td>0.8</td>
          <td>GTEx</td>
          <td>
            <Link to="/locus">
              <button>Gecko Plot</button>
            </Link>
          </td>
        </tr>
        <tr>
          <td>
            <Link to="/gene/ENSG0000002">CDK3</Link>
          </td>
          <td>0.92</td>
          <td>VEP</td>
          <td>
            <Link to="/locus">
              <button>Gecko Plot</button>
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
    <hr />
    <Heading>Associated studies</Heading>
    <SubHeading>
      Which studies are linked to this variant through a GWAS?
    </SubHeading>
    <Query query={pheWASQuery}>
      {({ loading, error, data }) => {
        return hasAssociations(data) ? (
          <Fragment>
            <PheWAS data={data} />
            <PheWASTable associations={data.pheWAS.associations} />
          </Fragment>
        ) : null;
      }}
    </Query>
    <hr />
    <Heading>Associated index variants</Heading>
    <SubHeading>
      Which index variants and studies are linked to this tag variant?
    </SubHeading>
    <Query query={associatedIndexesQuery}>
      {({ loading, error, data }) => {
        console.log('data', data);
        return hasAssociatedIndexVariants(data) ? (
          <AssociatedIndexVariantsTable
            data={data.indexVariantsAndStudiesForTagVariant.rows}
          />
        ) : null;
      }}
    </Query>
    <hr />
    <Heading>Associated tag variants</Heading>
    <SubHeading>
      Which tag variants and studies are linked to this index variant?
    </SubHeading>
    <Query query={associatedTagsQuery}>
      {({ loading, error, data }) => {
        console.log('data', data);
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
