import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Manhattan } from 'ot-charts';
import { PageTitle, Heading, SubHeading } from 'ot-ui';

import BasePage from './BasePage';

const manhattanQuery = gql`
  {
    manhattan(studyId: "GCT123") {
      associations {
        indexVariantId
        indexVariantRsId
        pval
        chromosome
        position
        credibleSetSize
        ldSetSize
        bestGenes
      }
    }
  }
`;

const StudyPage = ({ match }) => (
  <BasePage>
    <Helmet>
      <title>{match.params.studyId}</title>
    </Helmet>
    <PageTitle>{`Study ${match.params.studyId}`}</PageTitle>
    <hr />
    <Heading>Associated loci</Heading>
    <SubHeading>Which loci are significantly linked to this study?</SubHeading>
    <Query query={manhattanQuery} fetchPolicy="network-only">
      {({ loading, error, data }) => {
        // TODO: handle more gracefully within Manhattan
        if (data.manhattan) {
          return <Manhattan data={data.manhattan} />;
        } else {
          return <Manhattan data={{ associations: [] }} />;
        }
      }}
    </Query>

    <table>
      <thead>
        <tr>
          <td>variant</td>
          <td>rsid</td>
          <td>chromosome</td>
          <td>position</td>
          <td>eaf</td>
          <td>p-value</td>
          <td>variants in set</td>
          <td>...more columns to come</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Link to="/variant/1_100314838_C_T">1_100314838_C_T</Link>
          </td>
          <td>rs3753486</td>
          <td>1</td>
          <td>100314838</td>
          <td>0.047</td>
          <td>5.5e-6</td>
          <td>7</td>
        </tr>
        <tr>
          <td>
            <Link to="/variant/2_107731839_A_G">2_107731839_A_G</Link>
          </td>
          <td>rs3753487</td>
          <td>2</td>
          <td>107731839</td>
          <td>0.012</td>
          <td>2.3e-11</td>
          <td>5</td>
        </tr>
      </tbody>
    </table>
  </BasePage>
);

export default StudyPage;
