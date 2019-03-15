import React from 'react';

const PmidOrBiobankLink = ({ studyId, pmid }) =>
  studyId && studyId.startsWith('NEALE') ? (
    <a
      href="http://www.nealelab.is/uk-biobank"
      target="_blank"
      rel="noopener noreferrer"
    >
      UK Biobank
    </a>
  ) : (
    <a
      href={`http://europepmc.org/abstract/med/${pmid}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {pmid}
    </a>
  );

export default PmidOrBiobankLink;
