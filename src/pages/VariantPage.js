import React from 'react';
import { Link } from 'react-router-dom';
import { PheWAS } from 'ot-charts';
// import { Query, graphql } from 'react-apollo';

const VariantPage = ({ match }) => (
    <div>
        <h1>{`Variant ${match.params.variantId}`}</h1>
        <hr />
        <h2>Associated genes</h2>
        <table>
            <thead>
                <tr>
                    <td>gene</td>
                    <td>g2v score</td>
                    <td>g2v evidence</td>
                    <td></td>
                    <td>...more columns to come</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><Link to="/gene/ENSG0000001">CDK2</Link></td>
                    <td>0.8</td>
                    <td>GTEx</td>
                    <td><Link to="/locus"><button>Gecko Plot</button></Link></td>
                </tr>
                <tr>
                    <td><Link to="/gene/ENSG0000002">CDK3</Link></td>
                    <td>0.92</td>
                    <td>VEP</td>
                    <td><Link to="/locus"><button>Gecko Plot</button></Link></td>
                </tr>
            </tbody>
        </table>
        <hr />
        <h2>Associated studies</h2>
        <PheWAS />
        <table>
            <thead>
                <tr>
                    <td>study</td>
                    <td>reported trait</td>
                    <td>p-value</td>
                    <td>cases / total</td>
                    <td></td>
                    <td>...more columns to come</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><Link to="/study/GCST005806">GCST005806</Link></td>
                    <td>Blood protein levels</td>
                    <td>5.3e-11</td>
                    <td><Link to="/locus"><button>Gecko Plot</button></Link></td>
                </tr>
                <tr>
                    <td><Link to="/study/GCST005831">GCST005831</Link></td>
                    <td>Systemic lupus erythematosus</td>
                    <td>6.7e-32</td>
                    <td><Link to="/locus"><button>Gecko Plot</button></Link></td>
                </tr>
            </tbody>
        </table>
    </div>
);

export default VariantPage;
