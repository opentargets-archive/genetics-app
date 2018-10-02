import React from 'react';

const StudyInfo = ({ studyInfo }) => {
  return (
    <div>
      {`${studyInfo.pubAuthor} (${new Date(studyInfo.pubDate).getFullYear()}) `}
      {studyInfo.pubJournal && <em>{`${studyInfo.pubJournal} `}</em>}
      {studyInfo.pmid && (
        <a
          href={`http://europepmc.org/abstract/med/${studyInfo.pmid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {studyInfo.pmid}
        </a>
      )}
    </div>
  );
};

export default StudyInfo;
