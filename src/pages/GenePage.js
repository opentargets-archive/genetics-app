import React from 'react';
import { Link } from 'react-router-dom';
import { PageTitle, Heading, SubHeading } from 'ot-ui';

import BasePage from './BasePage';

const GenePage = ({ match }) => (
  <BasePage>
    <PageTitle>{`Gene ${match.params.geneId}`}</PageTitle>
    <hr />
    <Heading>Associated variants</Heading>
    <SubHeading>
      Which variants are functionally linked to this gene?
    </SubHeading>
    <table>
      <thead>
        <tr>
          <td>variant</td>
          <td>rsid</td>
          <td>g2v score</td>
          <td>g2v evidence</td>
          <td />
          <td>...more columns to come</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Link to="/variant/1_100314838_C_T">1_100314838_C_T</Link>
          </td>
          <td>rs3753486</td>
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
            <Link to="/variant/2_107731839_A_G">2_107731839_A_G</Link>
          </td>
          <td>rs3753487</td>
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
  </BasePage>
);

export default GenePage;
