import React from 'react';
import { Link } from 'react-router-dom';

import { OtTable, commaSeparate } from 'ot-ui';
import { getCytoband } from 'ot-charts';

import LocusLink from './LocusLink';

// this maps X, Y, and MT chromosomes to relative positions
// for sorting
const CHROM_MAP = {
  X: 0,
  Y: 1,
  MT: 2,
};

const chromosomeComparator = (aChrom, bChrom) => {
  if (aChrom === bChrom) {
    return 0;
  }

  if (isNaN(aChrom) && isNaN(bChrom)) {
    return CHROM_MAP[aChrom] - CHROM_MAP[bChrom];
  }
  if (isNaN(aChrom)) {
    return 1;
  }

  if (isNaN(bChrom)) {
    return -1;
  }

  return Number(aChrom) - Number(bChrom);
};

export const tableColumns = studyId => [
  {
    id: 'indexVariantId',
    label: 'Lead Variant',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
    comparator: (a, b) => {
      const { chromosome: aChrom, position: aPos } = a;
      const { chromosome: bChrom, position: bPos } = b;
      const chromResult = chromosomeComparator(aChrom, bChrom);

      if (chromResult === 0) {
        return aPos - bPos;
      }

      return chromResult;
    },
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
    renderCell: rowData => rowData.pval.toPrecision(3),
  },
  {
    id: 'credibleSetSize',
    label: 'Credible Set Size',
    tooltip: 'Number of variants in 95% credible set at this locus',
    renderCell: rowData => commaSeparate(rowData.credibleSetSize),
  },
  {
    id: 'ldSetSize',
    label: 'LD Set Size',
    tooltip:
      'Number of variants that are in LD (R2 >= 0.7) with this lead variant',
    renderCell: rowData => commaSeparate(rowData.ldSetSize),
  },
  {
    id: 'bestGenes',
    label: 'Best Genes',
    tooltip:
      'The list of genes with equal best overall score across all variants in either the credible set or LD expansion of a given locus',
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

function ManhattanTable({ data, studyId, filenameStem }) {
  return (
    <OtTable
      columns={tableColumns(studyId)}
      data={data}
      sortBy="pval"
      order="asc"
      downloadFileStem={filenameStem}
    />
  );
}

export default ManhattanTable;
