import React from 'react';

const StudyPage = ({ match }) => (
    <div>{`Study ${match.params.studyId}`}</div>
);

export default StudyPage;
