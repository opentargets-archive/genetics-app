import React from 'react';

import { Link, OtTable, significantFigures } from 'ot-ui';

import StudyLocusLink from './StudyLocusLink';

const tableColumns = [
  {
    id: 'study',
    label: 'Study',
    renderCell: d => (
      <Link to={`/study/${d.study.studyId}`}>{d.study.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Trait reported',
    renderCell: d => d.study.traitReported,
  },
  {
    id: 'pubAuthor',
    label: 'Author',
    renderCell: d => d.study.pubAuthor,
  },
  {
    id: 'indexVariant',
    label: 'Lead variant',
    renderCell: d => (
      <Link to={`/variant/${d.indexVariant.id}`}>{d.indexVariant.id}</Link>
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
    renderCell: d => (
      <StudyLocusLink
        hasSumsStats={d.study.hasSumsStats}
        indexVariantId={d.indexVariant.id}
        studyId={d.study.studyId}
      />
    ),
  },
];

const ColocTable = ({ loading, error, filenameStem, data }) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns}
    data={data}
    sortBy="log2h4h3"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;
