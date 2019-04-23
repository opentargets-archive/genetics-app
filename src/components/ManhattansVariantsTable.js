import React from 'react';

import { Link, OtTable } from 'ot-ui';
import { getCytoband } from 'ot-charts';

import LocusLink from './LocusLink';
import variantIdComparator from '../logic/variantIdComparator';
import cytobandComparator from '../logic/cytobandComparator';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

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
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns(studyIds)}
      data={dataWithCytoband}
      sortBy="indexVariantId"
      order="asc"
      downloadFileStem={filenameStem}
      message="Loci in this table are shared across all selected studies."
      reportTableDownloadEvent={format => {
        reportAnalyticsEvent({
          category: 'table',
          action: 'download',
          label: `study-comparison:intersecting-loci:${format}`,
        });
      }}
      reportTableSortEvent={(sortBy, order) => {
        reportAnalyticsEvent({
          category: 'table',
          action: 'sort-column',
          label: `study-comparison:intersecting-loci:${sortBy}(${order})`,
        });
      }}
    />
  );
}

export default ManhattansVariantsTable;
