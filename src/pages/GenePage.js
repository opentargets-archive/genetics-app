import React from 'react';
import { Link } from 'react-router-dom';

const GenePage = ({ match }) => (
    <div>
        <Link to="/">HOME</Link>
        <h1>{`Gene ${match.params.geneId}`}</h1>
        <hr />
        <h2>Associated variants</h2>
        <p>What about tissues?</p>
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
                        <Link to="/variant/1_100314838_C_T">
                            1_100314838_C_T
                        </Link>
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
                        <Link to="/variant/2_107731839_A_G">
                            2_107731839_A_G
                        </Link>
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
    </div>
);

export default GenePage;
