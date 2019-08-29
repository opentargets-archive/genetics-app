import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import * as d3 from 'd3';

import { Link, OtTableRF, DataDownloader, significantFigures } from 'ot-ui';

import StudyLocusLink from './StudyLocusLink';

const tableColumns = [
  {
    id: 'study',
    label: 'Study',
    comparator: (a, b) => d3.ascending(a.study.studyId, b.study.studyId),
    renderCell: d => (
      <Link component={RouterLink} to={`/study/${d.study.studyId}`}>
        {d.study.studyId}
      </Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Trait reported',
    comparator: (a, b) =>
      d3.ascending(a.study.traitReported, b.study.traitReported),
    renderCell: d => d.study.traitReported,
  },
  {
    id: 'pubAuthor',
    label: 'Author',
    comparator: (a, b) => d3.ascending(a.study.pubAuthor, b.study.pubAuthor),
    renderCell: d => d.study.pubAuthor,
  },
  {
    id: 'indexVariant',
    label: 'Lead variant',
    comparator: (a, b) => d3.ascending(a.indexVariant.id, b.indexVariant.id),
    renderCell: d => (
      <Link component={RouterLink} to={`/variant/${d.indexVariant.id}`}>
        {d.indexVariant.id}
      </Link>
    ),
  },
  {
    id: 'beta',
    label: 'Study beta',
    tooltip:
      'Effect with respect to the alternative allele of the page variant',
    renderCell: d => significantFigures(d.beta),
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
      d3.ascending(a.study.hasSumsStats, b.study.hasSumsStats),
    renderCell: d => (
      <StudyLocusLink
        hasSumsStats={d.study.hasSumsStats}
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

const ColocGWASTable = ({ loading, error, fileStem, data }) => {
  const downloadData = getDownloadData(data);
  return (
    <React.Fragment>
      <DataDownloader
        tableHeaders={tableColumns}
        rows={downloadData}
        fileStem={fileStem}
      />
      <OtTableRF
        loading={loading}
        error={error}
        columns={tableColumns}
        data={data}
        sortBy="log2h4h3"
        order="desc"
      />
    </React.Fragment>
  );
};

export default ColocGWASTable;
