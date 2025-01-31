import React from 'react';
import { max, scaleSqrt } from 'd3';
import { DataCircle, Link } from '../../../ot-ui-components';
import LabelHML from '../../../components/LabelHML';

import { generateComparator, commaSeparate } from '../../../utils';

import { radiusScale } from './utils';

export const createDistanceCellRenderer = schema => {
  return rowData => {
    const distanceData = rowData[schema.sourceId];
    if (distanceData !== undefined) {
      const { distance } = distanceData.tissues[0];
      return <React.Fragment>{commaSeparate(distance)}</React.Fragment>;
    }
  };
};

export const createDistanceAggregateCellRenderer = schema => {
  return rowData => {
    if (rowData.aggregated) {
      const { distance } = rowData.aggregated;
      return (
        <React.Fragment>
          {distance ? commaSeparate(distance) : null}
        </React.Fragment>
      );
    } else {
      return null;
    }
  };
};

export const createQtlCellRenderer = schema => {
  return rowData => {
    if (rowData[schema.sourceId] !== undefined) {
      const circleRadius = radiusScale(rowData[schema.sourceId]);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    }
  };
};

export const createAggregateCellRenderer = schema => {
  return rowData => {
    if (rowData.aggregated) {
      const circleRadius = radiusScale(rowData.aggregated.aggregatedScore);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    } else {
      return null;
    }
  };
};

export const createIntervalCellRenderer = schema => {
  return rowData => {
    if (rowData[schema.sourceId] !== undefined) {
      const circleRadius = radiusScale(rowData[schema.sourceId]);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    }
  };
};

export const createFPCellRenderer = schema => {
  return rowData => {
    const fpData = rowData[schema.sourceId];

    if (fpData !== undefined) {
      const { maxEffectLabel, maxEffectScore } = fpData.tissues[0];
      const level =
        0 <= maxEffectScore && maxEffectScore <= 1 / 3
          ? 'L'
          : 1 / 3 < maxEffectScore && maxEffectScore <= 2 / 3
          ? 'M'
          : 'H';
      return <LabelHML level={level}>{maxEffectLabel}</LabelHML>;
    }
  };
};

export const createFPAggregateCellRenderer = schema => {
  return rowData => {
    const fpData = rowData.aggregated;

    if (fpData !== undefined) {
      const { maxEffectLabel, maxEffectScore } = fpData.tissues[0];
      const level =
        0 <= maxEffectScore && maxEffectScore <= 1 / 3
          ? 'L'
          : 1 / 3 < maxEffectScore && maxEffectScore <= 2 / 3
          ? 'M'
          : 'H';
      return <LabelHML level={level}>{maxEffectLabel}</LabelHML>;
    }
  };
};

export const getColumnsAll = (genesForVariantSchema, genesForVariant) => {
  const overallScoreScale = scaleSqrt()
    .domain([
      0,
      max(genesForVariant, geneForVariant => geneForVariant.overallScore),
    ])
    .range([0, 6]);
  const columns = [
    {
      id: 'geneSymbol',
      label: 'Gene',
      renderCell: rowData => {
        return <Link to={`/gene/${rowData.geneId}`}>{rowData.geneSymbol}</Link>;
      },
    },
    {
      id: 'overallScore',
      label: 'Overall V2G',
      renderCell: rowData => {
        const circleRadius = overallScoreScale(rowData.overallScore);
        return <DataCircle radius={circleRadius} colorScheme="bold" />;
      },
    },
    ...genesForVariantSchema.distances.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceLabel,
      tooltip: schema.sourceDescriptionOverview,
      renderCell: createDistanceCellRenderer(schema),
      comparator: generateComparator(d =>
        d[schema.sourceId] && d[schema.sourceId].tissues[0].distance
          ? d[schema.sourceId].tissues[0].distance
          : null
      ),
    })),
    ...genesForVariantSchema.qtls.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceLabel,
      tooltip: schema.sourceDescriptionOverview,
      renderCell: createQtlCellRenderer(schema),
    })),
    ...genesForVariantSchema.intervals.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceLabel,
      tooltip: schema.sourceDescriptionOverview,
      renderCell: createIntervalCellRenderer(schema),
    })),
    ...genesForVariantSchema.functionalPredictions.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceLabel,
      tooltip: schema.sourceDescriptionOverview,
      renderCell: createFPCellRenderer(schema),
    })),
  ];

  return columns;
};
