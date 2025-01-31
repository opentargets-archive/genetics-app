import React from 'react';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import BaseHeader from '../../components/Header';
import { ExternalLink } from '../../components/ExternalLink';
import OverlapLink from '../../components/OverlapLink';

const StudyHeader = ({ loading, data }) => {
  const tittle = data?.studyInfo.traitReported;
  const studyId = data?.studyInfo.studyId;

  return (
    <BaseHeader
      title={tittle}
      loading={loading}
      Icon={faChartBar}
      externalLinks={
        <>
          {studyId && studyId.startsWith('NEALE2') ? (
            <ExternalLink
              title="UK Biobank"
              url={`http://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=${
                studyId.split('_')[1]
              }`}
              id={studyId.split('_')[1]}
            />
          ) : null}
          {studyId && studyId.startsWith('SAIGE') ? (
            <ExternalLink
              title="SAIGE"
              url="https://www.leelabsg.org/resources"
              id={studyId.replace('SAIGE_', '')}
            />
          ) : null}
          {studyId && studyId.startsWith('GCST') ? (
            <ExternalLink
              title="GWAS Catalog"
              url={`https://www.ebi.ac.uk/gwas/studies/${studyId.replace(
                /_\d+/,
                ''
              )}`}
              id={studyId.replace(/_\d+/, '')}
            />
          ) : null}
          {studyId && studyId.startsWith('FINNGEN') ? (
            <ExternalLink
              title="FinnGen"
              url={`https://r6.finngen.fi/pheno/${studyId.slice(11)}`}
              id={studyId.slice(11)}
            />
          ) : null}
        </>
      }
    >
      {!loading && <OverlapLink studyId={studyId} />}
    </BaseHeader>
  );
};

export default StudyHeader;
