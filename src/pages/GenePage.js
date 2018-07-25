import React from 'react';

const GenePage = ({ match }) => (
    <div>{`Gene ${match.params.geneId}`}</div>
);

export default GenePage;
