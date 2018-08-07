import React from 'react';
import { Regional } from 'ot-charts';

import { Page } from 'ot-ui';

const RegionalPage = ({ match }) => (
    <Page>
        <h1>{`Regional ${match.params.studyId}, ${match.params.variantId}`}</h1>
        <Regional />
    </Page>
);

export default RegionalPage;
