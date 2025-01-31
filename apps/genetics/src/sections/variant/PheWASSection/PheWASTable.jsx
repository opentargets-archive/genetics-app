import React from 'react';
import {
  Link,
  OtTable,
  commaSeparate,
  significantFigures,
  Autocomplete,
} from '../../../ot-ui-components';

import PmidOrBiobankLink from '../../../components/PmidOrBiobankLink';
import { pvalThreshold } from '../../../constants';
import { generateComparator } from '../../../utils';

export const tableColumns = ({
  traitFilterValue,
  traitFilterOptions,
  traitFilterHandler,
  categoryFilterValue,
  categoryFilterOptions,
  categoryFilterHandler,
}) => [
  {
    id: 'studyId',
    label: 'Study ID',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Trait',
    renderFilter: () => (
      <Autocomplete
        options={traitFilterOptions}
        value={traitFilterValue}
        handleSelectOption={traitFilterHandler}
        placeholder="None"
        multiple
      />
    ),
  },
  {
    id: 'traitCategory',
    label: 'Trait Category',
    renderFilter: () => (
      <Autocomplete
        options={categoryFilterOptions}
        value={categoryFilterValue}
        handleSelectOption={categoryFilterHandler}
        placeholder="None"
        multiple
      />
    ),
  },
  {
    id: 'pval',
    label: 'P-value',
    renderCell: rowData =>
      rowData.pval < pvalThreshold
        ? `<${pvalThreshold}`
        : significantFigures(rowData.pval),
  },
  {
    id: 'beta',
    label: 'Beta',
    tooltip: 'Beta is with respect to the ALT allele',
    renderCell: rowData => (rowData.beta ? rowData.beta.toPrecision(3) : null),
  },
  {
    id: 'oddsRatio',
    label: 'Odds Ratio',
    tooltip: 'Odds ratio is with respect to the ALT allele',
    renderCell: rowData =>
      rowData.oddsRatio ? rowData.oddsRatio.toPrecision(3) : null,
  },
  {
    id: 'pmid',
    label: 'PMID',
    renderCell: rowData => (
      <PmidOrBiobankLink studyId={rowData.studyId} pmid={rowData.pmid} />
    ),
  },
  {
    id: 'pubAuthor',
    label: 'Author (Year)',
    renderCell: rowData =>
      `${rowData.pubAuthor} (${new Date(rowData.pubDate).getFullYear()})`,
  },
  {
    id: 'nCases',
    label: 'N Cases',
    renderCell: rowData =>
      rowData.nCases !== null ? commaSeparate(rowData.nCases) : '',
  },
  {
    id: 'nTotal',
    label: 'N Overall',
    renderCell: rowData => commaSeparate(rowData.nTotal),
  },
  {
    id: 'hasSumstats',
    label: 'Has sumstats',
    comparator: generateComparator(d => d.hasSumstats),
    renderCell: rowData => (rowData.hasSumstats ? <>yes</> : <>no</>),
    export: rowData => (rowData.hasSumstats ? true : false),
  },
];

function PheWASTable({
  loading,
  error,
  associations,
  variantId,
  chromosome,
  position,
  isIndexVariant,
  isTagVariant,
  traitFilterValue,
  traitFilterOptions,
  traitFilterHandler,
  categoryFilterValue,
  categoryFilterOptions,
  categoryFilterHandler,
}) {
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns({
        variantId,
        chromosome,
        position,
        isIndexVariant,
        isTagVariant,
        traitFilterValue,
        traitFilterOptions,
        traitFilterHandler,
        categoryFilterValue,
        categoryFilterOptions,
        categoryFilterHandler,
      })}
      data={associations}
      sortBy="pval"
      order="asc"
      filters
      downloadFileStem={`${variantId}-associated-studies`}
      excludeDownloadColumns={['locusView']}
    />
  );
}

export default PheWASTable;
