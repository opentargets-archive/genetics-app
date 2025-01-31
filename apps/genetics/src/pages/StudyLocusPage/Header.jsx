import React from 'react';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import BaseHeader from '../../components/Header';
import { ExternalLink } from '../../components/ExternalLink';
import LocusLink from '../../components/LocusLink';

const StudyLocusHeader = ({ loading, data }) => {
  const studyId = data?.studyInfo.studyId;
  const tittleStudy = data?.studyInfo.traitReported;
  const variantId = data?.variantInfo.id;
  const tittle = !loading
    ? `${tittleStudy} and locus around ${variantId}`
    : null;

  const chromosome = !loading && variantId ? variantId.split('_')[0] : null;
  const positionString = !loading && variantId ? variantId.split('_')[1] : '';
  const position = parseInt(positionString, 10);

  return (
    <BaseHeader
      title={tittle}
      loading={loading}
      Icon={faProjectDiagram}
      externalLinks={
        <>
          {studyId ? (
            <ExternalLink
              title="Study ID"
              url={`/study/${studyId}`}
              id={studyId}
            />
          ) : null}
          {variantId ? (
            <ExternalLink
              title="Variant ID"
              url={`/variant/${variantId}`}
              id={variantId}
            />
          ) : null}
        </>
      }
    >
      {!loading && (
        <LocusLink
          chromosome={chromosome}
          position={position}
          selectedIndexVariants={[variantId]}
          selectedTagVariants={[variantId]}
        >
          View locus
        </LocusLink>
      )}
    </BaseHeader>
  );
};

export default StudyLocusHeader;
