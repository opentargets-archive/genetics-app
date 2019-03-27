import React from 'react';

const PmidOrBiobankLink = ({ studyId, pmid }) =>
  studyId && studyId.startsWith('NEALE') ? (
    <a
      href="https://www.nealelab.is/uk-biobank"
      target="_blank"
      rel="noopener noreferrer"
    >
      UK Biobank
    </a>
  ) : (
    <a
      href={`https://europepmc.org/abstract/med/${pmid.replace('PMID:', '')}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {pmid}
    </a>
  );

export default PmidOrBiobankLink;
