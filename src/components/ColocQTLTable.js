import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, Button, significantFigures } from 'ot-ui';

import GENE_MAPPING from '../mock-data/gene-mappings.json';

const GENE_PHENOTYPE_LOOKUP = GENE_MAPPING.reduce((acc, d) => {
  acc[d.phenotype] = d;
  return acc;
}, {});

const tableColumns = [
  {
    id: 'type',
    label: 'Molecular Trait',
    renderCell: d => 'eQTL',
  },
  {
    id: 'phenotype',
    label: 'Gene',
    renderCell: d => {
      if (d.phenotype && d.phenotype.startsWith('ILMN_')) {
        const { ensgId, symbol } = GENE_PHENOTYPE_LOOKUP[d.phenotype];
        return <Link to={`/gene/${ensgId}`}>{symbol}</Link>;
      } else {
        return <Link to={`/gene/${d.phenotype}`}>{d.phenotype}</Link>;
      }
    },
  },
  {
    id: 'bioFeature',
    label: 'Tissue',
  },
  {
    id: 'study',
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
    id: 'logH4H3',
    label: 'log(H4/H3)',
    renderCell: d => significantFigures(d.logH4H3),
  },
  {
    id: 'show',
    label: 'Regional Plot',
    renderCell: d => <Button gradient>Add track</Button>,
  },
];

const ColocTable = ({ loading, error, filenameStem, data }) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns}
    data={data}
    sortBy="logH4H3"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;
