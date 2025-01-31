import React from 'react';
import { ascending } from 'd3';
import { useQuery } from '@apollo/client';

import {
  Link,
  OtTableRF,
  DataDownloader,
  significantFigures,
  SectionHeading
} from '../../../ot-ui-components';

import STUDY_LOCUS_COLOCGWASTABLE from './StudyLocusColocGWASTable.gql';
import { getData, traitAuthorYear } from '../../../utils';
import StudyLocusLink from '../../../components/StudyLocusLink';
import { naLabel } from '../../../constants';

const tableColumns = [
  {
    id: 'study',
    label: 'Study',
    comparator: (a, b) => ascending(a.study.studyId, b.study.studyId),
    renderCell: d => (
      <Link to={`/study/${d.study.studyId}`}>{d.study.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Trait reported',
    comparator: (a, b) =>
      ascending(a.study.traitReported, b.study.traitReported),
    renderCell: d => d.study.traitReported,
  },
  {
    id: 'pubAuthor',
    label: 'Author',
    comparator: (a, b) => ascending(a.study.pubAuthor, b.study.pubAuthor),
    renderCell: d => d.study.pubAuthor,
  },
  {
    id: 'indexVariant',
    label: 'Lead variant',
    comparator: (a, b) => ascending(a.indexVariant.id, b.indexVariant.id),
    renderCell: d => (
      <Link to={`/variant/${d.indexVariant.id}`}>{d.indexVariant.id}</Link>
    ),
  },
  {
    id: 'beta',
    label: 'Study beta',
    tooltip:
      'Effect with respect to the alternative allele of the page variant',
    renderCell: d => (d.beta ? significantFigures(d.beta) : naLabel),
  },
  {
    id: 'h3',
    label: 'H3',
    tooltip: (
      <React.Fragment>
        Posterior probability that the signals <strong>do not</strong>{' '}
        colocalise
      </React.Fragment>
    ),
    renderCell: d => significantFigures(d.h3),
  },
  {
    id: 'h4',
    label: 'H4',
    tooltip: 'Posterior probability that the signals colocalise',
    renderCell: d => significantFigures(d.h4),
  },
  {
    id: 'log2h4h3',
    label: 'log2(H4/H3)',
    tooltip: 'Log-likelihood that the signals colocalise',
    renderCell: d => significantFigures(d.log2h4h3),
  },
  {
    id: 'locus',
    label: 'View',
    comparator: (a, b) =>
      ascending(a.study.hasSumstats, b.study.hasSumstats),
    renderCell: d => (
      <StudyLocusLink
        indexVariantId={d.indexVariant.id}
        studyId={d.study.studyId}
      />
    ),
  },
];

const getDownloadData = data => {
  return data.map(d => ({
    study: d.study.studyId,
    traitReported: d.study.traitReported,
    pubAuthor: d.study.pubAuthor,
    indexVariant: d.indexVariant.id,
    beta: d.beta,
    h3: d.h3,
    h4: d.h4,
    log2h4h3: d.log2h4h3,
  }));
};

const ColocGWASTable = ({ studyId, variantId }) => {
  const fileStem = `gwas-coloc-${studyId}-${variantId}`;
  let tableData = [];
  let downloadData;
  let studyInfo;

  const { loading, error, data: queryResult } = useQuery(
    STUDY_LOCUS_COLOCGWASTABLE,
    {
      variables: { variantId, studyId },
    }
  );

  if (queryResult) {
    downloadData = getDownloadData(queryResult.gwasColocalisation);
    tableData = getData(queryResult, 'gwasColocalisation');
    studyInfo = queryResult.studyInfo
  };

  if (!tableData) {
    return <></>;
  };

  return (
    <React.Fragment>
      <SectionHeading
        heading="GWAS Study Colocalisation"
        subheading={
          <React.Fragment>
            Which GWAS studies colocalise with{' '}
            <strong>{studyInfo ? traitAuthorYear(studyInfo) : ''}</strong> at this locus?
          </React.Fragment>
        }
      />
      <DataDownloader
        tableHeaders={tableColumns}
        rows={downloadData}
        fileStem={fileStem}
        loading={loading}
      />
      <OtTableRF
        loading={loading}
        error={error}
        columns={tableColumns}
        data={tableData}
        sortBy="log2h4h3"
        order="desc"
      />
    </React.Fragment>
  );
};

export default ColocGWASTable;
