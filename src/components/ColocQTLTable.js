import React from 'react';
import * as d3 from 'd3';

import { Link, OtTable, significantFigures } from 'ot-ui';

const tableColumns = [
  // {
  //   id: 'type',
  //   label: 'Molecular Trait',
  //   renderCell: d => 'eQTL',
  // },
  {
    id: 'gene.symbol',
    label: 'Gene',
    comparator: (a, b) => d3.ascending(a.gene.symbol, b.gene.symbol),
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  },
  {
    id: 'phenotypeId',
    label: 'Molecular trait',
    // renderCell: d => (d.phenotypeId !== d.gene.id ? d.phenotypeId : null),
  },
  {
    id: 'tissue.name',
    label: 'Tissue',
    comparator: (a, b) => d3.ascending(a.tissue.name, b.tissue.name),
    renderCell: d => d.tissue.name,
  },
  {
    id: 'qtlStudyName',
    label: 'Source',
  },
  {
    id: 'indexVariant',
    label: 'Lead variant',
    comparator: (a, b) => d3.ascending(a.indexVariant.id, b.indexVariant.id),
    renderCell: d => (
      <Link to={`/variant/${d.indexVariant.id}`}>{d.indexVariant.id}</Link>
    ),
  },
  {
    id: 'beta',
    label: 'QTL beta',
    tooltip:
      'QTL effect with respect to the alternative allele of the page variant',
    renderCell: d => significantFigures(d.beta),
  },
  {
    id: 'h3',
    label: 'H3',
    tooltip: (
      <React.Fragment>
        Posterior probability that the signals <strong>do not</strong>{' '}
        colocalise
      </React.Fragment>
    ),
    renderCell: d => significantFigures(d.h3),
  },
  {
    id: 'h4',
    label: 'H4',
    tooltip: 'Posterior probability that the signals colocalise',
    renderCell: d => significantFigures(d.h4),
  },
  {
    id: 'log2h4h3',
    label: 'log2(H4/H3)',
    tooltip: 'Log-likelihood that the signals colocalise',
    renderCell: d => significantFigures(d.log2h4h3),
  },
];

const ColocTable = ({ loading, error, filenameStem, data }) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns}
    data={data}
    sortBy="log2h4h3"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;
