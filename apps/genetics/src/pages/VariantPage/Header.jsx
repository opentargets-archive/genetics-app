import React from 'react';
import { faMapPin } from '@fortawesome/free-solid-svg-icons';
import BaseHeader from '../../components/Header';
import { ExternalLink } from '../../components/ExternalLink';
import LocusLink from '../../components/LocusLink';

const VariantHeader = ({ loading, data }) => {
  const { id, chromosomeB37, positionB37, refAllele, altAllele, rsId } =
    data?.variantInfo || {};
  const gnomadId = `${chromosomeB37}-${positionB37}-${refAllele}-${altAllele}`;
  const chromosome = !loading ? id.split('_')[0] : null;
  const positionString = !loading ? id.split('_')[1] : '';
  const position = parseInt(positionString, 10);

  return (
    <BaseHeader
      title={id}
      loading={loading}
      Icon={faMapPin}
      externalLinks={
        <>
          <ExternalLink
            title="Ensembl"
            url={`https://identifiers.org/ensembl:${rsId}`}
            id={rsId}
          />
          <ExternalLink
            title="gnomAD 2.1"
            url={`https://gnomad.broadinstitute.org/variant/${gnomadId}?dataset=gnomad_r2_1`}
            id={gnomadId}
          />
        </>
      }
    >
      {!loading && (
        <LocusLink
          chromosome={chromosome}
          position={position}
          selectedIndexVariants={[id]}
          selectedTagVariants={[id]}
        >
          View locus
        </LocusLink>
      )}
    </BaseHeader>
  );
};

export default VariantHeader;
