import React from 'react';
import * as d3 from 'd3';

import { OtTable, DataCircle, Tooltip } from '../ot-ui-components';

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

const studyIndexVariantToLabel = ({ study, variant }) => (
  <span style={{ textAlign: 'left', padding: '4px', display: 'inline-block' }}>
    <span style={{ whiteSpace: 'nowrap' }}>{traitAuthorYear(study)}</span>
    <br />
    {variant.id}
  </span>
);

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
  // studiesMetaData,
}) => {
  const uniqueStudyIndexVariantsLookup = data.reduce((acc, d) => {
    const leftId = `${d.leftStudy.studyId}-${d.leftVariant.id}`;
    acc[leftId] = {
      id: leftId,
      study: d.leftStudy,
      variant: d.leftVariant,
    };
    const rightId = `${d.rightStudy.studyId}-${d.rightVariant.id}`;
    acc[rightId] = {
      id: rightId,
      study: d.rightStudy,
      variant: d.rightVariant,
    };
    return acc;
  }, {});
  const uniqueStudyIndexVariantIds = Object.keys(
    uniqueStudyIndexVariantsLookup
  ).sort();
  const uniqueStudyIndexVariants = uniqueStudyIndexVariantIds.map(
    d => uniqueStudyIndexVariantsLookup[d]
  );
  const [minVal, maxVal] = d3.extent(data.map(d => d.log2h4h3));
  const absMax = Math.max(Math.abs(minVal), maxVal);
  const radiusScale = d3
    .scaleSqrt()
    .domain([0, absMax])
    .range([0, 6]);
  const studyIndexVariantColumns = uniqueStudyIndexVariants.map(sv => {
    const label = studyIndexVariantToLabel(sv);
    return {
      id: sv.id,
      label,
      verticalHeader: true,
      // comparator: studyComparator(s),
      renderCell: row => {
        const item = row[sv.id] || {};
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
  const dataByStudyIndexVariant = Object.values(uniqueStudyIndexVariants).map(
    ({ id, study, variant }) => ({
      study,
      variant,
      ...data
        .filter(
          d =>
            d.leftStudy.studyId === study.studyId &&
            d.leftVariant.id === variant.id
        )
        .reduce(
          (
            acc,
            { leftStudy, leftVariant, rightStudy, rightVariant, ...rest }
          ) => {
            acc[`${rightStudy.studyId}-${rightVariant.id}`] = { ...rest };
            return acc;
          },
          {}
        ),
    })
  );
  const studyIndexVariantColumn = {
    id: 'studyId',
    label: 'Study',
    renderCell: d => studyIndexVariantToLabel(d),
  };
  const tableColumns = [studyIndexVariantColumn, ...studyIndexVariantColumns];
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns}
      data={dataByStudyIndexVariant}
      verticalHeaders
      downloadFileStem={filenameStem}
    />
  );
};

export default ColocTable;
