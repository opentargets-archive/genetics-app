import React from 'react';

const StudyDetailCell = ({ pubAuthor, pubDate, traitReported, pubJournal }) => {
  let pubInfo = '';
  if (pubAuthor && pubDate) {
    pubInfo = ` ${pubAuthor} ${new Date(pubDate).getFullYear()}`;
  }
  return (
    <React.Fragment>
      <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
        {traitReported}
      </span>
      <br />
      <span style={{ fontSize: '0.75rem' }}>{pubInfo}</span>
      <span style={{ fontSize: '0.65rem', fontStyle: 'italic' }}>
        {' '}
        {pubJournal}
      </span>
    </React.Fragment>
  );
};

export default StudyDetailCell;
