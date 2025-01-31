import React, { Component } from 'react';
import * as d3 from 'd3';
import { withContentRect } from 'react-measure';

import theme from './theme';
import {
  chromosomeNames,
  chromosomesWithCumulativeLengths,
  SIGNIFICANCE,
} from '../utils';

const maxPos =
  chromosomesWithCumulativeLengths[chromosomesWithCumulativeLengths.length - 1]
    .cumulativeLength;

const totalLength = chromosomesWithCumulativeLengths.reduce((acc, ch) => {
  return acc + ch.length;
}, 0);

const getXTicks = x => {
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

const OUTER_HEIGHT = 430;
const OUTER_HEIGHT2 = 95;

const margin = { top: 20, right: 20, bottom: 30, left: 80 };
const margin2 = { top: 20, right: 20, bottom: 30, left: 80 };

const height = OUTER_HEIGHT - margin.top - margin.bottom;
const height2 = OUTER_HEIGHT2 - margin2.top - margin2.bottom;

const x2Ticks = getX2Ticks();

const customXAxis = (g, axis) => {
  g.call(axis);
  g.selectAll('.tick:nth-child(odd) line').remove();
  g.selectAll('.tick:nth-child(even) text').remove();
  g.selectAll('.tick text')
    .attr('fill', theme.axis.color)
    .attr('font-size', 12);
  g.selectAll('.domain, .tick line').attr('stroke', theme.axis.color);
};

const customYAxis = (g, axis) => {
  g.call(axis);
  g.selectAll('.tick text').attr('fill', theme.axis.color);
  g.selectAll('.domain, .tick line').attr('stroke', theme.axis.color);
};

class ManhattanPlot extends Component {
  svg = React.createRef();
  svg2 = React.createRef();
  clip = React.createRef();
  sigLine = React.createRef();
  brushRef = React.createRef();
  xAxisRef = React.createRef();
  yAxisRef = React.createRef();
  x2AxisRef = React.createRef();

  x = d3.scaleLinear().domain([0, totalLength]);
  x2 = d3.scaleLinear().domain([0, totalLength]);
  y = d3.scaleLinear().range([height, 0]);
  y2 = d3.scaleLinear().range([height2, 0]);

  xAxis = d3.axisBottom(this.x).tickFormat(d => getChromosomeName(d));
  yAxis = d3.axisLeft(this.y);
  x2Axis = d3
    .axisBottom(this.x2)
    .tickValues(x2Ticks)
    .tickFormat((d, i) => {
      return chromosomeNames[Math.floor(i / 2)];
    });

  brush = d3.brushX();
  zoom = d3.zoom().scaleExtent([1, Infinity]);

  state = {
    open: false,
    anchorEl: null,
    anchorData: [],
  };

  brushed = () => {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;

    const width = this._outerWidth() - margin.left - margin.right;
    const selection = d3.event.selection || this.x2.range();
    let [start, end] = selection.map(this.x2.invert, this.x2);
    start = start < 0 ? 0 : start;
    end = end > maxPos ? maxPos : end;
    this.x.domain([start, end]);

    // close tooltip when brushing
    this.setState({ open: false });

    d3.select(this.svg.current)
      .select('.focus')
      .selectAll('rect')
      .attr('x', d => this.x(d.globalPosition));

    // update ticks of xAxis
    this.xAxis.tickValues(getXTicks(this.x));
    d3.select(this.xAxisRef.current).call(customXAxis, this.xAxis);

    d3.select(this.svg.current).call(
      this.zoom.transform,
      d3.zoomIdentity
        .scale(width / (selection[1] - selection[0]))
        .translate(-selection[0], 0)
    );

    this.props.onZoom(start, end);
  };

  zoomed = () => {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;

    const { transform } = d3.event;
    let [start, end] = transform.rescaleX(this.x2).domain();
    start = start < 0 ? 0 : start;
    end = end > maxPos ? maxPos : end;
    this.x.domain([start, end]);

    // close tooltip when zooming
    this.setState({ open: false });

    const svg = d3.select(this.svg.current);
    const svg2 = d3.select(this.svg2.current);

    svg
      .select('.focus')
      .selectAll('rect')
      .attr('x', d => this.x(d.globalPosition));

    this.xAxis.tickValues(getXTicks(this.x));
    d3.select(this.xAxisRef.current).call(customXAxis, this.xAxis);

    svg2
      .select('.context')
      .select('.brush')
      .call(this.brush.move, this.x.range().map(transform.invertX, transform));

    this.props.onZoom(start, end);
  };

  componentDidMount() {
    this.brush.on('brush end', this.brushed);
    this.zoom.on('zoom', this.zoomed);
    this._render(this.handleMouseOver);
  }

  componentWillUnmount() {
    this.brush.on('brush end', null);
    this.zoom.on('zoom', null);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.associations !== prevProps.associations ||
      this.props.contentRect.bounds.width !== prevProps.contentRect.bounds.width
    ) {
      this._render(this.handleMouseOver);
    }
  }

  handleMouseLeave = () => {
    this.setState({ open: false, anchorEl: null, anchorData: [] });
  };

  handleMouseOver = (anchorEl, data) => {
    const { tableColumns, studyId } = this.props;
    const anchorData = tableColumns(studyId).map(
      ({ id, label, renderCell }) => {
        return {
          label,
          value: renderCell ? renderCell(data) : data[id],
        };
      }
    );
    this.setState({ anchorEl, open: true, anchorData });
  };

  render() {
    const { measureRef, listTooltip: ListTooltip } = this.props;
    const outerWidth = this._outerWidth();

    return (
      <div ref={measureRef} onMouseLeave={this.handleMouseLeave}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          ref={this.svg}
          width={outerWidth}
          height={OUTER_HEIGHT}
          cursor="move"
        >
          <defs>
            <clipPath id="clip">
              <rect ref={this.clip} height={height} />
            </clipPath>
          </defs>
          <g
            className="focus"
            transform={`translate(${margin.left}, ${margin.top})`}
            clipPath="url(#clip)"
          >
            <line ref={this.sigLine} x1="0" stroke={theme.secondary} />
          </g>
          <g
            ref={this.xAxisRef}
            transform={`translate(${margin.left}, ${OUTER_HEIGHT -
              margin.bottom})`}
            fontSize="12"
          />
          <g
            ref={this.yAxisRef}
            transform={`translate(${margin.left}, ${margin.top})`}
          />
          <text
            x="40"
            y="200"
            transform="rotate(-90 40,200)"
            fontFamily="sans-serif"
            fontSize="12"
            fill={theme.axis.color}
          >
            -log₁₀(p-value)
          </text>
          <ListTooltip
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            dataList={this.state.anchorData}
          />
        </svg>
        <svg ref={this.svg2} width={outerWidth} height={OUTER_HEIGHT2}>
          <g
            className="context"
            transform={`translate(${margin2.left}, ${margin2.top})`}
          >
            <g className="brush" ref={this.brushRef} />
            <g ref={this.x2AxisRef} transform={`translate(0, ${height2})`} />
          </g>
        </svg>
      </div>
    );
  }

  _outerWidth() {
    return this.props.contentRect.bounds.width;
  }

  _render(handleMouseOver) {
    const { associations } = this.props;
    const assocs = associations;

    const outerWidth = this._outerWidth();

    if (outerWidth === undefined) return;

    const width = outerWidth - margin.left - margin.right;

    this.x.range([0, width]);
    this.x2.range([0, width]);
    this.y.domain([0, d3.max(assocs, d => -Math.log10(d.pval)) || 0]);
    this.y2.domain([0, d3.max(assocs, d => -Math.log10(d.pval))]);

    const svg = d3.select(this.svg.current);
    const svg2 = d3.select(this.svg2.current);
    const focus = svg.select('.focus');
    const context = svg2.select('.context');
    d3.select(this.clip.current).attr('width', width);
    d3.select(this.sigLine.current)
      .attr('y1', this.y(SIGNIFICANCE))
      .attr('x2', width)
      .attr('y2', this.y(SIGNIFICANCE));

    const bars = focus.selectAll('rect').data(assocs);
    const bars2 = context.selectAll('rect').data(assocs);

    bars
      .enter()
      .append('rect')
      .style('cursor', 'auto')
      .attr('width', 2)
      .attr('fill', theme.line.color)
      .attr('x', d => this.x(d.globalPosition))
      .attr('y', d => this.y(-Math.log10(d.pval)))
      .attr('height', d => this.y(0) - this.y(-Math.log10(d.pval)))
      .on('mouseover', function(d) {
        handleMouseOver(this, d);
      });

    bars.exit().remove();

    d3.select(this.yAxisRef.current).call(customYAxis, this.yAxis);

    bars2
      .enter()
      .append('rect')
      .attr('width', 2)
      .attr('fill', theme.line.color)
      .attr('y', d => this.y2(-Math.log10(d.pval)))
      .attr('height', d => this.y2(0) - this.y2(-Math.log10(d.pval)))
      .merge(bars2)
      .attr('x', d => this.x2(d.globalPosition));

    bars2.exit().remove();

    d3.select(this.x2AxisRef.current).call(customXAxis, this.x2Axis);

    this.brush.extent([[0, 0], [width, height2]]);

    this.zoom
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);

    d3.select(this.brushRef.current)
      .call(this.brush)
      .call(this.brush.move, this.x.range());

    d3.select(this.svg.current).call(this.zoom);
  }
}

export default withContentRect('bounds')(ManhattanPlot);
