import React from 'react';
import { faMapPin } from '@fortawesome/free-solid-svg-icons';
import BaseHeader from '../../components/Header';
import { ExternalLink } from '../../components/ExternalLink';
import LocusLink from '../../components/LocusLink';
import {
  variantHasAssociatedTagVariants,
  variantHasAssociatedIndexVariants,
} from '../../utils';

const VariantHeader = ({ loading, data }) => {
  const id = data?.variantInfo.id;
  const rsId = data?.variantInfo.rsId;
  const chromosome = !loading ? id.split('_')[0] : null;
  const positionString = !loading ? id.split('_')[1] : '';
  const position = parseInt(positionString, 10);

  const isTagVariant = variantHasAssociatedIndexVariants(data);
  const isIndexVariant = variantHasAssociatedTagVariants(data);

  return (
    <BaseHeader
      title={id}
      loading={loading}
      Icon={faMapPin}
      externalLinks={
        <>
          <ExternalLink
            title="Ensembl"
            url={`https://identifiers.org/ensembl:${id}`}
            id={id}
          />
          <ExternalLink
            title="gnomAD"
            url={`http://www.ensembl.org/Homo_sapiens/Variation/Explore?v=${rsId}`}
            id={rsId}
          />
        </>
      }
    >
      {!loading &&
        (isIndexVariant || isTagVariant) && (
          <LocusLink
            chromosome={chromosome}
            position={position}
            selectedIndexVariants={isIndexVariant ? [id] : null}
            selectedTagVariants={isTagVariant && !isIndexVariant ? [id] : null}
          >
            View locus
          </LocusLink>
        )}
    </BaseHeader>
  );
};

export default VariantHeader;
