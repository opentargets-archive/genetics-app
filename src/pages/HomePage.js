import React from 'react';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const HomePage = () => (
    <div>
        <h1>Home</h1>
        <hr />
        <ul>
            <li><Link to="/gene/ENSG0000002">example gene</Link></li>
            <li><Link to="/variant/1_100314838_C_T">example variant</Link></li>
            <li><Link to="/study/GCST005806">example study</Link></li>
        </ul>

        <Query query={
                gql`{
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
                }`
            }
        >
            {({ loading, error, data }) => {
                    console.log('data', data);
                    return null;               
            }}
        </Query>
    </div>
);

export default HomePage;
