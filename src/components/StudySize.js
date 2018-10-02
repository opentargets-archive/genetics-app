import React from 'react';
import { commaSeparate } from 'ot-ui';

const StudySize = ({ studyInfo }) => {
  const { nInitial, nReplication, nCases } = studyInfo;
  return (
    <div>
      {nInitial !== null && `N Study: ${commaSeparate(nInitial)}`}{' '}
      {nReplication !== null && `N Replication: ${commaSeparate(nReplication)}`}{' '}
      {nCases !== null && `N Cases: ${commaSeparate(nCases)}`}
    </div>
  );
};

export default StudySize;
