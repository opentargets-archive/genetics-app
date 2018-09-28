import React from 'react';
import { Link } from 'react-router-dom';

import { OtTable } from 'ot-ui';
import { getCytoband } from 'ot-charts';

import LocusLink from './LocusLink';
import chromosomeComparator from '../logic/chromosomeComparator';

const tableColumns = studyIds => [
  {
    id: 'indexVariantId',
    label: 'Variant',
    tooltip:
      'The locus tagged by this variant is shared across all selected studies',
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
    id: 'bestGenes',
    label: 'Top Ranked Genes',
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
        selectedStudies={studyIds}
      >
        Locus
      </LocusLink>
    ),
  },
];

function ManhattansVariantsTable({ data, studyIds, filenameStem }) {
  return (
    <OtTable
      columns={tableColumns(studyIds)}
      data={data}
      sortBy="pval"
      order="asc"
      downloadFileStem={filenameStem}
      message="Loci in this table are shared across all selected studies."
    />
  );
}

export default ManhattansVariantsTable;
