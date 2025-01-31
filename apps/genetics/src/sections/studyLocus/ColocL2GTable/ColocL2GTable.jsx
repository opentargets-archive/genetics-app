import React from 'react';
import { ascending } from 'd3';
import { useQuery } from '@apollo/client';
import { commaSeparate, getData } from '../../../utils';

import {
  Link,
  OtTableRF,
  DataDownloader,
  significantFigures,
  SectionHeading,
} from '../../../ot-ui-components';

import STUDY_LOCUS_COLOCL2GTABLE from './StudyLocusColocL2GTable.gql';

const tableColumns = [
  {
    id: 'gene.symbol',
    label: 'Gene',
    comparator: (a, b) => ascending(a.gene.symbol, b.gene.symbol),
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  },
  {
    id: 'yProbaModel',
    label: 'Overall L2G score',
    tooltip:
      'Overall evidence linking gene to this study using all features. Score range [0, 1].',
    comparator: (a, b) => ascending(a.yProbaModel, b.yProbaModel),
    renderCell: d => significantFigures(d.yProbaModel),
  },
  {
    id: 'yProbaPathogenicity',
    label: 'Variant Pathogenicity',
    tooltip:
      'Evidence linking gene to this study including variant pathogenicity features only. Score range [0, 1].',
    comparator: (a, b) =>
      ascending(a.yProbaPathogenicity, b.yProbaPathogenicity),
    renderCell: d => significantFigures(d.yProbaPathogenicity),
  },
  {
    id: 'yProbaDistance',
    label: 'Distance',
    tooltip:
      'Evidence linking gene to this study including distance features only. Score range [0, 1].',
    comparator: (a, b) => ascending(a.yProbaDistance, b.yProbaDistance),
    renderCell: d => significantFigures(d.yProbaDistance),
  },
  {
    id: 'yProbaMolecularQTL',
    label: 'QTL Coloc',
    tooltip:
      'Evidence linking gene to this study including molecular trait colocalisation features only. Score range [0, 1].',
    comparator: (a, b) =>
      ascending(a.yProbaMolecularQTL, b.yProbaMolecularQTL),
    renderCell: d => significantFigures(d.yProbaMolecularQTL),
  },
  {
    id: 'yProbaInteraction',
    label: 'Chromatin Interaction',
    tooltip:
      'Evidence linking gene to this study including chromatin interaction features only. Score range [0, 1].',
    comparator: (a, b) =>
      ascending(a.yProbaInteraction, b.yProbaInteraction),
    renderCell: d => significantFigures(d.yProbaInteraction),
  },
  {
    id: 'distanceToLocus',
    label: 'Distance to locus (bp)',
    comparator: (a, b) => ascending(a.distanceToLocus, b.distanceToLocus),
    renderCell: d =>
      d.distanceToLocus ? commaSeparate(d.distanceToLocus) : '',
  },
  {
    id: 'hasColoc',
    label: 'Evidence of colocalisation',
    renderCell: d =>
      d.hasColoc ? (
        <a href="#coloc" style={{ color: '#3489ca', textDecoration: 'none' }}>
          Yes
        </a>
      ) : (
        'No'
      ),
  },
];

const getDownloadColumns = () => {
  return [
    { id: 'geneSymbol', label: 'Gene' },
    { id: 'geneId', label: 'Gene ID' },
    { id: 'yProbaModel', label: 'Overall L2G score' },

    { id: 'yProbaPathogenicity', label: 'Variant Pathogenicity' },
    { id: 'yProbaDistance', label: 'Distance' },
    { id: 'yProbaMolecularQTL', label: 'QTL Coloc' },
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
    yProbaMolecularQTL: d.yProbaMolecularQTL,
    yProbaInteraction: d.yProbaInteraction,
    distanceToLocus: d.distanceToLocus,
    hasColoc: d.hasColoc,
  }));
};

const ColocL2GTable = ({ variantId, studyId }) => {
  const fileStem = `l2g-assignment-${studyId}-${variantId}`;
  let tableData = [];

  const { loading, error, data: queryResult } = useQuery(
    STUDY_LOCUS_COLOCL2GTABLE,
    {
      variables: { variantId, studyId },
    }
  );

  if (
    queryResult &&
    queryResult.studyLocus2GeneTable.rows &&
    queryResult.studyLocus2GeneTable.rows.length > 0
  ) {
    tableData = getData(queryResult.studyLocus2GeneTable.rows);
  }

  return (
    <React.Fragment>
      <SectionHeading
        heading="Gene prioritisation using locus-to-gene pipeline"
        subheading="Which genes were prioritised by L2G pipeline at this locus?"
      />
      <DataDownloader
        tableHeaders={getDownloadColumns()}
        rows={getDownloadRows(tableData)}
        fileStem={fileStem}
        loading={loading}
      />

      <OtTableRF
        loading={loading}
        error={error}
        columns={tableColumns}
        data={tableData}
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
