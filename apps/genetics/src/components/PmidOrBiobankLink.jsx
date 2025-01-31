import React from 'react';
import { Link } from '../ot-ui-components';

const PmidOrBiobankLink = ({ studyId, pmid }) => {
  if (studyId) {
    if (studyId.startsWith('NEALE2')) {
      return (
        <Link external to="https://www.nealelab.is/uk-biobank">
          UK Biobank
        </Link>
      );
    } else if (studyId.startsWith('SAIGE')) {
      return (
        <Link external to="https://www.leelabsg.org/resources">
          SAIGE
        </Link>
      );
    } else if (pmid) {
      return (
        <Link
          external
          to={`https://europepmc.org/abstract/med/${pmid.replace('PMID:', '')}`}
        >
          {pmid}
        </Link>
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default PmidOrBiobankLink;
