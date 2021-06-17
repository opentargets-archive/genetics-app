import React, { Fragment } from 'react';
import * as d3 from 'd3';

import {
  Link,
  OtTableRF,
  Autocomplete,
  significantFigures,
  DataDownloader,
} from 'ot-ui';

import StudyLocusLink from './StudyLocusLink';

const getDownloadColumns = () => {
  return [
    {
      id: 'study',
      label: 'Study',
    },
    {
      id: 'traitReported',
      label: 'Trait reported',
    },
    {
      id: 'pubAuthor',
      label: 'Author',
    },
    {
      id: 'indexVariant',
      label: 'Lead variant',
    },
    {
      id: 'phenotypeId',
      label: 'Phenotype',
    },
    {
      id: 'tissueName',
      label: 'Tissue',
    },
    {
      id: 'qtlStudyId',
      label: 'Source',
    },
    {
      id: 'h3',
      label: 'H3',
    },
    {
      id: 'h4',
      label: 'H4',
    },
    {
      id: 'log2h4h3',
      label: 'log2(H4/H3)',
    },
  ];
};

const getDownloadRows = rows => {
  return rows.map(row => ({
    study: row.study.studyId,
    traitReported: row.study.traitReported,
    pubAuthor: row.study.pubAuthor,
    indexVariant: row.leftVariant.id,
    phenotypeId: row.phenotypeId,
    tissueName: row.tissue.name,
    qtlStudyId: row.qtlStudyId,
    h3: row.h3,
    h4: row.h4,
    log2h4h3: row.log2h4h3,
  }));
};

const tableColumns = ({
  colocTraitFilterValue,
  colocTraitFilterOptions,
  colocTraitFilterHandler,
}) => [
  {
    id: 'study',
    label: 'Study',
    comparator: (a, b) => d3.ascending(a.study.studyId, b.study.studyId),
    renderCell: d => (
      <Link to={`/study/${d.study.studyId}`}>{d.study.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Trait reported',
    comparator: (a, b) =>
      d3.ascending(a.study.traitReported, b.study.traitReported),
    renderCell: d => d.study.traitReported,
    renderFilter: () => (
      <Autocomplete
        options={colocTraitFilterOptions}
        value={colocTraitFilterValue}
        handleSelectOption={colocTraitFilterHandler}
        placeholder="None"
        multiple
      />
    ),
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
    comparator: (a, b) => d3.ascending(a.leftVariant.id, b.leftVariant.id),
    renderCell: d => (
      <Link to={`/variant/${d.leftVariant.id}`}>{d.leftVariant.id}</Link>
    ),
  },
  {
    id: 'phenotypeId',
    label: 'Phenotype',
  },
  {
    id: 'tissue.name',
    label: 'Tissue',
    comparator: (a, b) => d3.ascending(a.tissue.name, b.tissue.name),
    renderCell: d => d.tissue.name,
  },
  {
    id: 'qtlStudyId',
    label: 'Source',
  },
  // {
  //   id: 'beta',
  //   label: 'QTL beta',
  //   renderCell: d => significantFigures(d.beta),
  // },
  {
    id: 'h3',
    label: 'H3',
    renderCell: d => significantFigures(d.h3),
  },
  {
    id: 'h4',
    label: 'H4',
    renderCell: d => significantFigures(d.h4),
  },
  {
    id: 'log2h4h3',
    label: 'log2(H4/H3)',
    renderCell: d => significantFigures(d.log2h4h3),
  },
  {
    id: 'studyLocus',
    label: 'View',
    renderCell: d => (
      <StudyLocusLink
        indexVariantId={d.leftVariant.id}
        studyId={d.study.studyId}
      />
    ),
  },
];

const ColocTable = ({
  loading,
  error,
  filenameStem,
  data,
  colocTraitFilterValue,
  colocTraitFilterOptions,
  colocTraitFilterHandler,
}) => (
  <Fragment>
    <DataDownloader
      tableHeaders={getDownloadColumns()}
      rows={getDownloadRows(data)}
      fileStem={filenameStem}
    />
    <OtTableRF
      loading={loading}
      error={error}
      columns={tableColumns({
        colocTraitFilterValue,
        colocTraitFilterOptions,
        colocTraitFilterHandler,
      })}
      filters
      data={data}
      sortBy="log2h4h3"
      order="desc"
      downloadFileStem={filenameStem}
    />
  </Fragment>
);

export default ColocTable;
