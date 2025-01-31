import { ascending } from 'd3';

import { Link, Autocomplete, significantFigures } from '../../ot-ui-components';

import StudyLocusLink from '../StudyLocusLink';
import { generateComparator, getPhenotypeId } from '../../utils';

export const getDownloadColumns = () => {
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
    {
      id: 'hasSumstats',
      label: 'Has sumstats',
    },
  ];
};

export const getDownloadRows = rows => {
  return rows.map(row => ({
    study: row.study.studyId,
    traitReported: row.study.traitReported,
    pubAuthor: row.study.pubAuthor,
    indexVariant: row.leftVariant.id,
    phenotypeId: getPhenotypeId(row.phenotypeId),
    tissueName: row.tissue.name,
    qtlStudyId: row.qtlStudyId,
    h3: row.h3,
    h4: row.h4,
    log2h4h3: row.log2h4h3,
    hasSumstats: row.study.hasSumstats,
  }));
};

export const tableColumns = ({
  colocTraitFilterValue,
  colocTraitFilterOptions,
  colocTraitFilterHandler,
}) => [
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
    comparator: (a, b) => ascending(a.study.pubAuthor, b.study.pubAuthor),
    renderCell: d => d.study.pubAuthor,
  },
  {
    id: 'indexVariant',
    label: 'Lead variant',
    comparator: (a, b) => ascending(a.leftVariant.id, b.leftVariant.id),
    renderCell: d => (
      <Link to={`/variant/${d.leftVariant.id}`}>{d.leftVariant.id}</Link>
    ),
  },
  {
    id: 'phenotypeId',
    label: 'Molecular trait',
    tooltip: 'Entity that colocalises with the QTL in a given GWAS study',
    comparator: (a, b) =>
      ascending(getPhenotypeId(a.phenotypeId), getPhenotypeId(b.phenotypeId)),
    renderCell: d => getPhenotypeId(d.phenotypeId),
  },
  {
    id: 'tissue.name',
    label: 'Tissue',
    comparator: (a, b) => ascending(a.tissue.name, b.tissue.name),
    renderCell: d => d.tissue.name,
  },
  {
    id: 'qtlStudyId',
    label: 'Source',
  },
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
    id: 'hasSumstats',
    label: 'Has sumstats',
    comparator: generateComparator(d => d.study.hasSumstats),
    renderCell: d => (d.study.hasSumstats ? <>yes</> : <>no</>),
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
