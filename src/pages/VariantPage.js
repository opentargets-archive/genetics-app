import React from 'react';

import { PheWAS } from 'ot-charts';
// import { Query, graphql } from 'react-apollo';

const VariantPage = ({ match }) => (
    <div>
        <h1>{`Variant ${match.params.variantId}`}</h1>
        <PheWAS />
    </div>
);

export default VariantPage;
