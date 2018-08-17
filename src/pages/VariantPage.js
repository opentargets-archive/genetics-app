import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PheWAS } from 'ot-charts';
import { PageTitle, Heading, SubHeading } from 'ot-ui';
import PheWASTable from '../components/PheWASTable';

import BasePage from './BasePage';

function hasAssociations(data) {
  return (
    data.pheWAS &&
    data.pheWAS.associations &&
    data.pheWAS.associations.length > 0
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
        console.log(data);
        return hasAssociations(data) ? (
          <Fragment>
            <PheWAS data={data} />
            <PheWASTable associations={data.pheWAS.associations} />
          </Fragment>
        ) : null;
      }}
    </Query>
  </BasePage>
);

export default VariantPage;
