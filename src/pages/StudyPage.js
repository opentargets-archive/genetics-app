import React from 'react';
import { Manhattan } from 'ot-charts';

const StudyPage = ({ match }) => (
    <div>
        <h1>{`Study ${match.params.studyId}`}</h1>
        <Manhattan />
    </div>
);

export default StudyPage;
