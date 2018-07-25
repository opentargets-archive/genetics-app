import React from 'react';
import { Link } from 'react-router-dom';
import { Regional } from 'ot-charts';

const RegionalPage = ({ match }) => (
    <div>
        <Link to="/">HOME</Link>
        <h1>{`Regional ${match.params.studyId}, ${match.params.variantId}`}</h1>
        <Regional />
    </div>
);

export default RegionalPage;
