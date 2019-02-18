import React, { Component } from 'react';
import * as d3 from 'd3';

import { chromosomeNames, chromosomesWithCumulativeLengths } from 'ot-charts';

const maxPos =
  chromosomesWithCumulativeLengths[chromosomesWithCumulativeLengths.length - 1]
    .cumulativeLength;

const totalLength = chromosomesWithCumulativeLengths.reduce((acc, ch) => {
  return acc + ch.length;
}, 0);

const calculateGlobalPosition = associations => {
  return associations.map(assoc => {
    const ch = chromosomesWithCumulativeLengths.find(
      ch => ch.name === assoc.chromosome
    );

    return {
      position: ch.cumulativeLength - ch.length + assoc.position,
      pval: assoc.pval,
    };
  });
};

const getXTicks = () => {
  const [start, end] = x.domain();
  const chRange = findChRange(x.domain());

  if (chRange.length === 1) {
    return [start, (start + end) / 2];
  }

  const ticks = [];
  ticks.push(start);
  ticks.push((start + chRange[0].cumulativeLength) / 2);

  for (let i = 1; i < chRange.length - 1; i++) {
    const chromosome = chRange[i];
    ticks.push(chromosome.cumulativeLength - chromosome.length);
    ticks.push(chromosome.cumulativeLength - chromosome.length / 2);
  }

  const lastCh = chRange[chRange.length - 1];
  ticks.push(lastCh.cumulativeLength - lastCh.length);
  ticks.push((lastCh.cumulativeLength - lastCh.length + end) / 2);

  return ticks;
};

const getX2Ticks = () => {
  const ticks = [];
  chromosomesWithCumulativeLengths.forEach(ch => {
    const chStart = ch.cumulativeLength - ch.length;
    const chMiddle = chStart + ch.length / 2;
    ticks.push(chStart);
    ticks.push(chMiddle);
  });

  return ticks;
};

const findChRange = range => {
  const [start, end] = range;

  const chStart = chromosomesWithCumulativeLengths.findIndex(ch => {
    return (
      ch.cumulativeLength - ch.length <= start && start < ch.cumulativeLength
    );
  });
  const chEnd = chromosomesWithCumulativeLengths.findIndex(ch => {
    return ch.cumulativeLength - ch.length < end && end <= ch.cumulativeLength;
  });

  const chRange = [];
  for (let i = chStart; i <= chEnd; i++) {
    chRange.push(chromosomesWithCumulativeLengths[i]);
  }

  return chRange;
};

const getChromosomeName = pos => {
  const chromosome = chromosomesWithCumulativeLengths.find(ch => {
    return ch.cumulativeLength - ch.length <= pos && pos < ch.cumulativeLength;
  });
  return chromosome.name;
};

const OUTER_WIDTH = 1100;
const OUTER_HEIGHT = 500;
const OUTER_HEIGHT2 = 95;

const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const margin2 = { top: 20, right: 20, bottom: 30, left: 40 };

const width = OUTER_WIDTH - margin.left - margin.right;
const height = OUTER_HEIGHT - margin.top - margin.bottom;
const height2 = OUTER_HEIGHT2 - margin2.top - margin2.bottom;

const x = d3
  .scaleLinear()
  .domain([0, totalLength])
  .range([0, width]);

const x2 = d3
  .scaleLinear()
  .domain([0, totalLength])
  .range([0, width]);

const x2Ticks = getX2Ticks(x2);

const y = d3.scaleLinear().range([height, 0]);
const y2 = d3.scaleLinear().range([height2, 0]);

const brush = d3.brushX().extent([[0, 0], [width, height2]]);

const zoom = d3
  .zoom()
  .scaleExtent([1, Infinity])
  .translateExtent([[0, 0], [width, height]])
  .extent([[0, 0], [width, height]]);

const customXAxis = (g, axis) => {
  g.call(axis);
  g.selectAll('.tick:nth-child(odd) line').remove();
  g.selectAll('.tick:nth-child(even) text').remove();
};

const Bar = ({ x, y, height }) => (
  <rect className="bars" x={x} y={y} width="1" height={height} />
);

class ManhattanPlot extends Component {
  state = {};

  svg = React.createRef();
  svg2 = React.createRef();
  brush = React.createRef();
  xAxisRef = React.createRef();
  yAxisRef = React.createRef();
  x2AxisRef = React.createRef();

  xAxis = d3.axisBottom(x).tickFormat(d => getChromosomeName(d));
  yAxis = d3.axisLeft(y);
  x2Axis = d3
    .axisBottom(x2)
    .tickValues(x2Ticks)
    .tickFormat((d, i) => {
      return chromosomeNames[Math.floor(i / 2)];
    });

  static getDerivedStateFromProps(props, state) {
    const { associations } = props;
    const assocs = calculateGlobalPosition(associations);

    y.domain([0, d3.max(assocs, d => -Math.log10(d.pval))]);
    y2.domain([0, d3.max(assocs, d => -Math.log10(d.pval))]);

    const bars = assocs.map(d => {
      return {
        x: x(d.position),
        y: y(-Math.log10(d.pval)),
        height: y(0) - y(-Math.log10(d.pval)),
      };
    });

    const bars2 = assocs.map(d => {
      return {
        x: x2(d.position),
        y: y2(-Math.log10(d.pval)),
        height: y2(0) - y2(-Math.log10(d.pval)),
      };
    });

    return { assocs, bars, bars2 };
  }

  componentDidMount() {
    d3.select(this.svg.current).call(zoom);
    d3.select(this.brush.current)
      .call(brush)
      .call(brush.move, x.range());

    brush.on('brush end', this.brushed);
    zoom.on('zoom', this.zoomed);
    this._render();
  }

  componentDidUpdate() {
    this._render();
  }

  render() {
    const { bars, bars2 } = this.state;
    return (
      <div>
        <svg ref={this.svg} width={OUTER_WIDTH} height={OUTER_HEIGHT}>
          <defs>
            <clipPath id="clip">
              <rect width={width} height={height} />
            </clipPath>
          </defs>
          <g
            className="focus"
            transform={`translate(${margin.left}, ${margin.top})`}
          >
            {bars.map((bar, i) => (
              <Bar key={i} {...bar} />
            ))}
            <g
              className="axis x--axis"
              ref={this.xAxisRef}
              transform={`translate(0, ${height})`}
            />
            <g className="axis y--axis" ref={this.yAxisRef} />
          </g>
        </svg>
        <svg ref={this.svg2} width={OUTER_WIDTH} height={OUTER_HEIGHT2}>
          <g
            className="context"
            transform={`translate(${margin2.left}, ${margin2.top})`}
          >
            {bars2.map((bar, i) => (
              <Bar key={i} {...bar} />
            ))}
            <g className="brush" ref={this.brush} />
            <g
              className="axis x--axis"
              ref={this.x2AxisRef}
              transform={`translate(0, ${height2})`}
            />
          </g>
        </svg>
      </div>
    );
  }

  _render() {
    d3.select(this.xAxisRef.current).call(customXAxis, this.xAxis);
    d3.select(this.yAxisRef.current).call(this.yAxis);
    d3.select(this.x2AxisRef.current).call(customXAxis, this.x2Axis);
  }

  brushed = () => {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;

    const { assocs } = this.state;
    const selection = d3.event.selection || x2.range();
    let [start, end] = selection.map(x2.invert, x2);
    start = start < 0 ? 0 : start;
    end = end > maxPos ? maxPos : end;
    x.domain([start, end]);

    const bars = assocs.map(d => {
      return {
        x: x(d.position),
        y: y(-Math.log10(d.pval)),
        height: y(0) - y(-Math.log10(d.pval)),
      };
    });

    this.setState({ bars });

    // update ticks of xAxis
    this.xAxis.tickValues(getXTicks());
    d3.select(this.xAxisRef.current).call(customXAxis, this.xAxis);

    d3.select(this.svg.current).call(
      zoom.transform,
      d3.zoomIdentity
        .scale(width / (selection[1] - selection[0]))
        .translate(-selection[0], 0)
    );
  };

  zoomed = () => {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;

    const { assocs } = this.state;
    const { transform } = d3.event;
    let [start, end] = transform.rescaleX(x2).domain();
    start = start < 0 ? 0 : start;
    end = end > maxPos ? maxPos : end;
    x.domain([start, end]);

    const bars = assocs.map(d => {
      return {
        x: x(d.position),
        y: y(-Math.log10(d.pval)),
        height: y(0) - y(-Math.log10(d.pval)),
      };
    });

    this.setState({ bars });

    this.xAxis.tickValues(getXTicks());
    d3.select(this.xAxisRef.current).call(customXAxis, this.xAxis);

    d3.select(this.svg2.current)
      .select('.context')
      .select('.brush')
      .call(brush.move, x.range().map(transform.invertX, transform));
  };
}

export default ManhattanPlot;
