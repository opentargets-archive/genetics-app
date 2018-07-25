import React from 'react';

const RegionalPage = ({ match }) => (
    <div>{`Regional ${match.params.studyId}, ${match.params.variantId}`}</div>
);

export default RegionalPage;
