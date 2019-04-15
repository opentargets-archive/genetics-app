import React, { Component } from 'react';
import * as d3 from 'd3';
import { withContentRect } from 'react-measure';

const OUTER_HEIGHT = 100;
const margin = { top: 20, right: 20, bottom: 20, left: 200 };
const HEIGHT = OUTER_HEIGHT - margin.top - margin.bottom;
const HALF_WINDOW = 500000;

class CredibleSetTrackPlot extends Component {
  state = {};
  xAxis = d3.axisBottom();
  xAxisRef = React.createRef();

  static getDerivedStateFromProps(props) {
    const { data, position, contentRect } = props;
    const { width: outerWidth = 0 } = contentRect.bounds;
    const width =
      outerWidth === 0 ? outerWidth : outerWidth - margin.left - margin.right;
    const start = position - HALF_WINDOW;
    const end = position + HALF_WINDOW;

    const xScale = d3
      .scaleLinear()
      .domain([start, end])
      .range([0, width]);

    const bars = data.map(d => {
      return {
        x: xScale(d.position),
      };
    });

    return { bars, width, xScale };
  }

  componentDidUpdate() {
    const { xScale } = this.state;
    this.xAxis.scale(xScale);
    d3.select(this.xAxisRef.current).call(this.xAxis);
  }

  render() {
    const { label, data, measureRef } = this.props;
    const { bars, width } = this.state;
    return (
      <div ref={measureRef}>
        <svg width={width} height={OUTER_HEIGHT}>
          <text x={margin.left} y={OUTER_HEIGHT / 2} dy="10" textAnchor="end">
            {label}
          </text>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {bars.map((bar, i) => {
              return <rect key={i} x={bar.x} y="0" width="2" height={HEIGHT} />;
            })}
          </g>
          <g
            ref={this.xAxisRef}
            transform={`translate(${margin.left}, ${margin.top + HEIGHT})`}
          />
        </svg>
      </div>
    );
  }
}

export default withContentRect('bounds')(CredibleSetTrackPlot);
