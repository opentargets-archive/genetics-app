import React from 'react';
import { Regional } from 'ot-charts';

const RegionalPage = ({ match }) => (
    <div>
        <h1>{`Regional ${match.params.studyId}, ${match.params.variantId}`}</h1>
        <Regional />
    </div>
);

export default RegionalPage;
