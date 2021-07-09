import React from 'react';
import { withContentRect } from 'react-measure';

import theme from './theme';
import { chromosomesWithCumulativeLengths } from '../utils';

const chromosomeMap = chromosomesWithCumulativeLengths.reduce((acc, d) => {
  acc[d.name] = d;
  return acc;
}, {});
const chromosomeLabelWidthThreshold = 700;

const ManhattanFlat = ({ measureRef, data, contentRect, onClick }) => {
  const { width } = contentRect.bounds;
  const height = 20;
  return (
    <div ref={measureRef}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
        {width ? (
          <React.Fragment>
            <g>
              {chromosomesWithCumulativeLengths.map((d, i) => {
                return (
                  <React.Fragment key={`chr${d.name}`}>
                    <rect
                      x={d.proportionalStart * width}
                      y={0}
                      width={(d.proportionalEnd - d.proportionalStart) * width}
                      height={height}
                      fill={
                        i % 2 === 0
                          ? theme.track.background
                          : theme.track.backgroundAlternate
                      }
                    />
                    {width > chromosomeLabelWidthThreshold ? (
                      <text
                        x={
                          ((d.proportionalStart + d.proportionalEnd) * width) /
                          2
                        }
                        y={height / 2}
                        fill="white"
                        fontSize={10}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {d.name}
                      </text>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </g>
            <g>
              {data.map(d => {
                const c = chromosomeMap[d.chromosome];
                const position =
                  (c.proportionalStart +
                    (d.position / c.length) *
                      (c.proportionalEnd - c.proportionalStart)) *
                  width;
                return (
                  <line
                    key={
                      d.variantIdA && d.variantIdB
                        ? `${d.variantIdA}-${d.variantIdB}`
                        : d.variantId
                    }
                    x1={position}
                    y1={0}
                    x2={position}
                    y2={height}
                    stroke={
                      d.inIntersection ? theme.secondary : theme.line.color
                    }
                    strokeWidth={2}
                    cursor={onClick ? 'pointer' : 'inherit'}
                    onClick={() => onClick(d)}
                  />
                );
              })}
            </g>
          </React.Fragment>
        ) : null}
      </svg>
    </div>
  );
};

export default withContentRect('bounds')(ManhattanFlat);
