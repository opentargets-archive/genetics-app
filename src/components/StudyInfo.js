import React from 'react';

const StudyInfo = ({ studyInfo }) => {
  return (
    <div>
      {`${studyInfo.pubAuthor} (${new Date(studyInfo.pubDate).getFullYear()}) `}
    </div>
  );
};

export default StudyInfo;
