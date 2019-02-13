import React, { Component } from 'react';
import * as d3 from 'd3';

import { chromosomeNames, chromosomesWithCumulativeLengths } from 'ot-charts';
import { ListTooltip } from 'ot-ui';
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

const margin = { top: 20, right: 20, bottom: 110, left: 40 };
const margin2 = { top: 430, right: 20, bottom: 30, left: 40 };

const width = OUTER_WIDTH - margin.left - margin.right;
const height = OUTER_HEIGHT - margin.top - margin.bottom;
const height2 = OUTER_HEIGHT - margin2.top - margin2.bottom;

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

class ManhattanPlot extends Component {
  svg = React.createRef();
  brush = React.createRef();
  zoom = React.createRef();
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

  state = {
    open: false,
    anchorEl: null,
    dataList: [{ label: 'label1', value: 'value1' }],
  };

  brushed = () => {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;

    const selection = d3.event.selection || x2.range();
    let [start, end] = selection.map(x2.invert, x2);
    start = start < 0 ? 0 : start;
    end = end > maxPos ? maxPos : end;
    x.domain([start, end]);

    this.setState({ open: false });

    d3.select(this.svg.current)
      .select('.focus')
      .selectAll('rect')
      .attr('x', d => x(d.position))
      .attr('y', d => y(-Math.log10(d.pval)))
      .attr('height', d => y(0) - y(-Math.log10(d.pval)));

    // update ticks of xAxis
    this.xAxis.tickValues(getXTicks());
    d3.select(this.xAxisRef.current).call(customXAxis, this.xAxis);

    d3.select(this.zoom.current).call(
      zoom.transform,
      d3.zoomIdentity
        .scale(width / (selection[1] - selection[0]))
        .translate(-selection[0], 0)
    );
  };

  zoomed = () => {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
    const { transform } = d3.event;
    let [start, end] = transform.rescaleX(x2).domain();
    start = start < 0 ? 0 : start;
    end = end > maxPos ? maxPos : end;
    x.domain([start, end]);

    this.setState({ open: false });

    const svg = d3.select(this.svg.current);

    svg
      .select('.focus')
      .selectAll('rect')
      .attr('x', d => x(d.position))
      .attr('y', d => y(-Math.log10(d.pval)))
      .attr('height', d => y(0) - y(-Math.log10(d.pval)));

    this.xAxis.tickValues(getXTicks());
    d3.select(this.xAxisRef.current).call(customXAxis, this.xAxis);

    svg
      .select('.context')
      .select('.brush')
      .call(brush.move, x.range().map(transform.invertX, transform));
  };

  componentDidMount() {
    brush.on('brush end', this.brushed);
    zoom.on('zoom', this.zoomed);
    this._render(this.handleMouseOver);
  }

  componentDidUpdate(prevProps) {
    if (this.props.associations !== prevProps.associations) {
      this._render(this.handleMouseOver);
    }
  }

  handleMouseLeave = () => {
    this.setState({ open: false, anchorEl: null });
  };

  handleMouseOver = anchorEl => {
    this.setState({ anchorEl, open: true });
  };

  render() {
    return (
      <div onMouseLeave={this.handleMouseLeave}>
        <svg ref={this.svg} width={OUTER_WIDTH} height={OUTER_HEIGHT}>
          <defs>
            <clipPath id="clip">
              <rect width={width} height={height} />
            </clipPath>
          </defs>
          <rect
            className="zoom"
            ref={this.zoom}
            width={width}
            height={height}
            transform={`translate(${margin.left},${margin.top})`}
          />
          <g
            className="focus"
            transform={`translate(${margin.left}, ${margin.top})`}
          >
            <g
              className="axis x--axis"
              ref={this.xAxisRef}
              transform={`translate(0, ${height})`}
            />
            <g className="axis y--axis" ref={this.yAxisRef} />
          </g>
          <g
            className="context"
            transform={`translate(${margin2.left}, ${margin2.top})`}
          >
            <g className="brush" ref={this.brush} />
            <g
              className="axis x--axis"
              ref={this.x2AxisRef}
              transform={`translate(0, ${height2})`}
            />
          </g>
          <ListTooltip
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            dataList={this.state.dataList}
          />
        </svg>
      </div>
    );
  }

  _render(handleMouseOver) {
    const { associations } = this.props;
    const assocs = calculateGlobalPosition(associations);

    y.domain([0, d3.max(assocs, d => -Math.log10(d.pval))]);
    y2.domain([0, d3.max(assocs, d => -Math.log10(d.pval))]);

    const svg = d3.select(this.svg.current);
    const focus = svg.select('.focus');
    const context = svg.select('.context');

    const bars = focus.selectAll('rect').data(assocs);
    const bars2 = context.selectAll('rect').data(assocs);

    bars
      .enter()
      .append('rect')
      .attr('class', 'bars')
      .attr('width', 2)
      .attr('x', d => x(d.position))
      .attr('y', d => y(-Math.log10(d.pval)))
      .attr('height', d => y(0) - y(-Math.log10(d.pval)))
      .on('mouseover', function(d) {
        handleMouseOver(this);
      });

    bars.exit().remove();

    d3.select(this.yAxisRef.current).call(this.yAxis);

    bars2
      .enter()
      .append('rect')
      .attr('width', 2)
      .attr('x', d => x2(d.position))
      .attr('y', d => y2(-Math.log10(d.pval)))
      .attr('height', d => y2(0) - y2(-Math.log10(d.pval)));

    bars2.exit().remove();

    d3.select(this.x2AxisRef.current).call(customXAxis, this.x2Axis);

    d3.select(this.brush.current)
      .call(brush)
      .call(brush.move, x.range());

    d3.select(this.zoom.current).call(zoom);
  }
}

export default ManhattanPlot;
