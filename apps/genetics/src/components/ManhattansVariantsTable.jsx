import React from 'react';

import { Link, OtTableRF, DataDownloader } from '../ot-ui-components';

import variantIdComparator from '../logic/variantIdComparator';
import cytobandComparator from '../logic/cytobandComparator';
import { getCytoband } from '../utils';

const tableColumns = studyIds => [
  {
    id: 'indexVariantId',
    label: 'Variant',
    tooltip:
      'This locus is shared across all selected studies. Only the lead variant in the root study is shown.',
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
    comparator: cytobandComparator,
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
];

function ManhattansVariantsTable({
  loading,
  error,
  data,
  studyIds,
  filenameStem,
}) {
  const dataWithCytoband = data.map(d => {
    const {
      indexVariantId,
      indexVariantRsId,
      bestGenes,
      chromosome,
      position,
    } = d;
    return {
      indexVariantId,
      indexVariantRsId,
      bestGenes,
      chromosome,
      position,
      cytoband: getCytoband(chromosome, position),
    };
  });
  const downloadData = dataWithCytoband.map(row => {
    console.log(row);
    return {
      ...row,
      bestGenes: row.bestGenes.map(d => d.gene.symbol).join(', '),
    }
  });

  return (
    <OtTableRF
      right={
        <DataDownloader
        tableHeaders={tableColumns(studyIds)}
        rows={downloadData}
        fileStem={filenameStem}
        />
      }
      loading={loading}
      error={error}
      columns={tableColumns(studyIds)}
      data={dataWithCytoband}
      sortBy="indexVariantId"
      order="asc"
      message="Loci in this table are shared across all selected studies."
    />
  );
}

export default ManhattansVariantsTable;
