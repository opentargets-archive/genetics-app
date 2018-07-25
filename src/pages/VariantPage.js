import React from 'react';
// import { Query, graphql } from 'react-apollo';

const VariantPage = ({ match }) => (
    <div>{`Variant ${match.params.variantId}`}</div>
);

export default VariantPage;
