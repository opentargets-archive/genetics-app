import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

import LocusLink from './LocusLink';
import { pvalThreshold } from '../constants';

export const tableColumns = ({
  variantId,
  chromosome,
  position,
  isIndexVariant,
  isTagVariant,
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
  },
  {
    id: 'traitCategory',
    label: 'Trait Category',
  },
  {
    id: 'pval',
    label: 'P-value',
    renderCell: rowData =>
      rowData.pval < pvalThreshold
        ? `<${pvalThreshold}`
        : rowData.pval.toPrecision(3),
  },
  {
    id: 'beta',
    label: 'Beta',
    renderCell: rowData => (rowData.beta ? rowData.beta.toPrecision(3) : null),
  },
  {
    id: 'oddsRatio',
    label: 'Odds Ratio',
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
  associations,
  variantId,
  chromosome,
  position,
  isIndexVariant,
  isTagVariant,
}) {
  return (
    <OtTable
      columns={tableColumns({
        variantId,
        chromosome,
        position,
        isIndexVariant,
        isTagVariant,
      })}
      data={associations}
      sortBy="pval"
      order="asc"
      downloadFileStem="associated-studies"
      excludeDownloadColumns={['locusView']}
    />
  );
}

export default PheWASTable;
