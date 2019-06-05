import React from 'react';
import * as d3 from 'd3';

import { OtTable, DataCircle, Tooltip } from 'ot-ui';

// TODO: When more studies are available in the data, use hierarchical clustering
//       to sort columns. See eg. `clusterfck`.

const traitAuthorYear = s =>
  `${s.traitReported} (${s.pubAuthor}, ${new Date(s.pubDate).getFullYear()})`;

const studyVariantToLabel = (s, studiesMetaData) => {
  const [studyId, chromosome, position, ref, alt] = s.split('__');
  const study = studiesMetaData[studyId];
  return (
    <span
      style={{ textAlign: 'left', padding: '4px', display: 'inline-block' }}
    >
      <span style={{ whiteSpace: 'nowrap' }}>{traitAuthorYear(study)}</span>
      <br />
      {`${chromosome}_${position}_${ref}_${alt}`}
    </span>
  );
};

const studyComparator = t => (a, b) => {
  if (a[t] && b[t]) {
    return a[t].log2h4h3 > b[t].log2h4h3
      ? 1
      : a[t].log2h4h3 === b[t].log2h4h3
        ? 0
        : -1;
  } else if (a[t] && !b[t]) {
    return 1;
  } else if (!a[t] && b[t]) {
    return -1;
  } else {
    return 0;
  }
};

const ColocTable = ({
  loading,
  error,
  filenameStem,
  data,
  studiesMetaData,
}) => {
  const uniqueStudies = Object.keys(data).sort();
  const log2h4h3s = Object.values(data).reduce((acc, d) => {
    const dlog2h4h3s = Object.values(d).map(d2 => d2.log2h4h3);
    return acc.concat(dlog2h4h3s);
  }, []);
  const [minVal, maxVal] = d3.extent(log2h4h3s);
  const absMax = Math.max(Math.abs(minVal), maxVal);
  const radiusScale = d3
    .scaleSqrt()
    .domain([0, absMax])
    .range([0, 6]);
  const tissueColumns = uniqueStudies.map(s => {
    const label = studyVariantToLabel(s, studiesMetaData);
    return {
      id: s,
      label,
      verticalHeader: true,
      comparator: studyComparator(s),
      renderCell: row => {
        const item = row[s] || {};
        const { h3, h4, log2h4h3 } = item;

        if (!log2h4h3 || !h3 || !h4) {
          // no comparison made
          return null;
        }

        const qtlRadius = radiusScale(Math.abs(log2h4h3));
        const qtlColor = log2h4h3 > 0 ? 'blue' : 'red';
        return (
          <Tooltip
            title={`log2(H4/H3): ${log2h4h3.toPrecision(
              3
            )}, H3: ${h3.toPrecision(3)}, H4: ${h4.toPrecision(3)}`}
          >
            <span>
              <DataCircle radius={qtlRadius} colorScheme={qtlColor} />
            </span>
          </Tooltip>
        );
      },
    };
  });
  const dataByStudy = uniqueStudies.map(s => ({ studyId: s, ...data[s] }));
  const studyColumn = {
    id: 'studyId',
    label: 'Study',
    renderCell: d => studyVariantToLabel(d.studyId, studiesMetaData),
  };
  const tableColumns = [studyColumn, ...tissueColumns];
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns}
      data={dataByStudy}
      verticalHeaders
      downloadFileStem={filenameStem}
    />
  );
};

export default ColocTable;
