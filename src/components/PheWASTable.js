import React from 'react';
import { Link } from 'react-router-dom';
import {
  OtTable,
  commaSeparate,
  significantFigures,
  Autocomplete,
} from 'ot-ui';

import LocusLink from './LocusLink';
import { pvalThreshold } from '../constants';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

export const tableColumns = ({
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
    id: 'locusView',
    label: 'View',
    renderCell: () => {
      return isIndexVariant ? (
        <LocusLink
          chromosome={chromosome}
          position={position}
          selectedIndexVariants={[variantId]}
        >
          Locus
        </LocusLink>
      ) : isTagVariant ? (
        <LocusLink
          chromosome={chromosome}
          position={position}
          selectedTagVariants={[variantId]}
        >
          Locus
        </LocusLink>
      ) : null;
    },
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
      reportTableDownloadEvent={format => {
        reportAnalyticsEvent({
          category: 'table',
          action: 'download',
          label: `variant:phewas:${format}`,
        });
      }}
      reportTableSortEvent={(sortBy, order) => {
        reportAnalyticsEvent({
          category: 'table',
          action: 'sort-column',
          label: `variant:phewas:${sortBy}(${order})`,
        });
      }}
    />
  );
}

export default PheWASTable;
