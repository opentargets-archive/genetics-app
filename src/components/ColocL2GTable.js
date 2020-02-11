import React from 'react';
import * as d3 from 'd3';

import {
  Link,
  OtTableRF,
  DataDownloader,
  significantFigures,
  commaSeparate,
} from 'ot-ui';

const tableColumns = [
  {
    id: 'gene.symbol',
    label: 'Gene',
    comparator: (a, b) => d3.ascending(a.gene.symbol, b.gene.symbol),
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  },
  {
    id: 'yProbaModel',
    label: 'Overall L2G score',
    tooltip:
      'Overall evidence linking gene to this study using all features. Score range [0, 1].',
    comparator: (a, b) => d3.ascending(a.yProbaModel, b.yProbaModel),
    renderCell: d => significantFigures(d.yProbaModel),
  },
  {
    id: 'yProbaPathogenicity',
    label: 'Variant Pathogenicity',
    tooltip:
      'Evidence linking gene to this study including variant pathogenicity features only. Score range [0, 1].',
    comparator: (a, b) =>
      d3.ascending(a.yProbaPathogenicity, b.yProbaPathogenicity),
    renderCell: d => significantFigures(d.yProbaPathogenicity),
  },
  {
    id: 'yProbaDistance',
    label: 'Distance',
    tooltip:
      'Evidence linking gene to this study including distance features only. Score range [0, 1].',
    comparator: (a, b) => d3.ascending(a.yProbaDistance, b.yProbaDistance),
    renderCell: d => significantFigures(d.yProbaDistance),
  },
  {
    id: 'yProbaInterlocus',
    label: 'QTL Coloc',
    tooltip:
      'Evidence linking gene to this study including molecular trait colocalisation features only. Score range [0, 1].',
    comparator: (a, b) => d3.ascending(a.yProbaInterlocus, b.yProbaInterlocus),
    renderCell: d => significantFigures(d.yProbaInterlocus),
  },
  {
    id: 'yProbaInteraction',
    label: 'Chromatin Interaction',
    tooltip:
      'Evidence linking gene to this study including chromatin interaction features only. Score range [0, 1].',
    comparator: (a, b) =>
      d3.ascending(a.yProbaInteraction, b.yProbaInteraction),
    renderCell: d => significantFigures(d.yProbaInteraction),
  },
  {
    id: 'distanceToLocus',
    label: 'Distance to locus (bp)',
    comparator: (a, b) => d3.ascending(a.distanceToLocus, b.distanceToLocus),
    renderCell: d =>
      d.distanceToLocus ? commaSeparate(d.distanceToLocus) : '',
  },
  {
    id: 'hasColoc',
    label: 'Evidence of colocalisation',
    renderCell: d => (d.hasColoc ? <a href="#coloc">Yes</a> : 'No'),
  },
];

const getDownloadColumns = () => {
  return [
    { id: 'geneSymbol', label: 'Gene' },
    { id: 'geneId', label: 'Gene ID' },
    { id: 'yProbaModel', label: 'Overall L2G score' },

    { id: 'yProbaPathogenicity', label: 'Variant Pathogenicity' },
    { id: 'yProbaDistance', label: 'Distance' },
    { id: 'yProbaInterlocus', label: 'QTL Coloc' },
    { id: 'yProbaInteraction', label: 'Chromatin Interaction' },

    { id: 'distanceToLocus', label: 'Distance to Locus ' },
    { id: 'hasColoc', label: 'Evidence of colocalisation' },
  ];
};

const getDownloadRows = data => {
  return data.map(d => ({
    geneSymbol: d.gene.symbol,
    geneId: d.gene.id,
    yProbaModel: d.yProbaModel,
    yProbaPathogenicity: d.yProbaPathogenicity,
    yProbaDistance: d.yProbaDistance,
    yProbaInterlocus: d.yProbaInterlocus,
    yProbaInteraction: d.yProbaInteraction,
    distanceToLocus: d.distanceToLocus,
    hasColoc: d.hasColoc,
  }));
};

const ColocL2GTable = ({ loading, error, fileStem, data }) => {
  return (
    <React.Fragment>
      <DataDownloader
        tableHeaders={getDownloadColumns()}
        rows={getDownloadRows(data)}
        fileStem={fileStem}
      />
      <OtTableRF
        loading={loading}
        error={error}
        columns={tableColumns}
        data={data}
        sortBy="yProbaModel"
        order="desc"
        headerGroups={[
          { colspan: 2, label: '' },
          {
            colspan: 4,
            label: 'Partial L2G scores',
          },
          { colspan: 3, label: '' },
        ]}
      />
    </React.Fragment>
  );
};

export default ColocL2GTable;
