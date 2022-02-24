import React, { Component } from 'react';
import * as d3 from 'd3';
import sizeMe from 'react-sizeme';

import theme from './theme';

const significantFigures = d3.format('.2g');

const OUTER_HEIGHT = 40;
const HEIGHT =
  OUTER_HEIGHT - theme.margin.credibleSetTop - theme.margin.credibleSetBottom;

class CredibleSet extends Component {
  state = {};

  static getDerivedStateFromProps(props) {
    const { data, start, end, size } = props;
    const { width: outerWidth = 0 } = size;
    const width =
      outerWidth === 0
        ? 0
        : outerWidth - theme.margin.left - theme.margin.right;

    const xScale = d3
      .scaleLinear()
      .domain([start, end])
      .range([0, width]);

    const posteriorProbabilityScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(['cyan', 'darkblue']);

    const bars = data.map(d => {
      return {
        x: xScale(d.position),
        color: posteriorProbabilityScale(d.posteriorProbability),
      };
    });

    return { width, bars, xScale };
  }

  render() {
    const { label, h4, logH4H3, size } = this.props;
    const { width, bars } = this.state;
    const { width: outerWidth } = size;

    return (
      <div style={{ width: '100%' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={`${outerWidth}px`}
          height={OUTER_HEIGHT}
        >
          <g
            transform={`translate(${theme.margin.left}, ${
              theme.margin.credibleSetTop
            })`}
          >
            <text
              fontSize={14}
              fontWeight="bold"
              dy={-5}
              fill={theme.axis.color}
            >
              {label}
            </text>
            {logH4H3 && h4 ? (
              <text
                fontSize={14}
                fontWeight="bold"
                textAnchor="end"
                dx={width}
                dy={-5}
                fill={theme.axis.color}
              >
                log(H4/H3): {significantFigures(logH4H3)}, H4:{' '}
                {significantFigures(h4)}
              </text>
            ) : null}
            <rect
              stroke={theme.track.background}
              fill={theme.track.backgroundAlternate}
              x={0}
              y={0}
              width={width}
              height={HEIGHT}
            />
          </g>
          <g
            transform={`translate(${theme.margin.left}, ${
              theme.margin.credibleSetTop
            })`}
          >
            {bars.map((bar, i) => {
              return (
                <rect
                  stroke="none"
                  fill={bar.color}
                  key={i}
                  x={bar.x}
                  y={0}
                  width={2}
                  height={HEIGHT}
                />
              );
            })}
          </g>
        </svg>
      </div>
    );
  }
}

export default sizeMe()(CredibleSet);
