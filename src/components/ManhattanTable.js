import React from 'react';
import { Link } from 'react-router-dom';

import { OtTable, commaSeparate, significantFigures } from 'ot-ui';
import { getCytoband } from 'ot-charts';

import LocusLink from './LocusLink';
import { pvalThreshold } from '../constants';
import variantIdComparator from '../logic/variantIdComparator';

export const tableColumns = studyId => [
  {
    id: 'indexVariantId',
    label: 'Lead Variant',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
    comparator: variantIdComparator,
  },
  {
    id: 'indexVariantRsId',
    label: 'rsID',
  },
  {
    id: 'cytoband',
    label: 'Cytoband',
    renderCell: rowData => {
      const [chromosome, position] = rowData.indexVariantId.split('_');
      return getCytoband(chromosome, position);
    },
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
    id: 'credibleSetSize',
    label: 'Credible Set Size',
    tooltip: 'Number of variants in 95% credible set at this locus',
    renderCell: rowData =>
      rowData.credibleSetSize ? commaSeparate(rowData.credibleSetSize) : null,
  },
  {
    id: 'ldSetSize',
    label: 'LD Set Size',
    tooltip:
      'Number of variants that are in LD (R2 >= 0.7) with this lead variant',
    renderCell: rowData =>
      rowData.ldSetSize ? commaSeparate(rowData.ldSetSize) : null,
  },
  {
    id: 'bestGenes',
    label: 'Top Ranked Genes',
    tooltip:
      'The list of genes with equal best overall score for this lead variant',
    renderCell: rowData => (
      <React.Fragment>
        {rowData.bestGenes.map((d, i) => (
          <React.Fragment key={i}>
            <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>{' '}
          </React.Fragment>
        ))}
      </React.Fragment>
    ),
  },
  {
    id: 'locus',
    label: 'View',
    renderCell: rowData => (
      <LocusLink
        chromosome={rowData.chromosome}
        position={rowData.position}
        selectedIndexVariants={[rowData.indexVariantId]}
        selectedStudies={[studyId]}
      >
        Locus
      </LocusLink>
    ),
  },
];

function ManhattanTable({ loading, error, data, studyId, filenameStem }) {
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns(studyId)}
      data={data}
      sortBy="pval"
      order="asc"
      downloadFileStem={filenameStem}
    />
  );
}

export default ManhattanTable;
