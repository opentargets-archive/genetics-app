import React from 'react';
import * as d3 from 'd3';
import { withContentRect } from 'react-measure';

import theme from './theme';

const posteriorProbabilityScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range(['cyan', 'darkblue']);

class Regional extends React.Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.x = d3.scaleLinear();
    this.y = d3.scaleLinear();
    this.voronoi = d3.voronoi();
  }

  componentDidMount() {
    this._render();
  }

  componentDidUpdate() {
    this._render();
  }

  render() {
    const { measureRef } = this.props;
    const { outerWidth, outerHeight } = this._dimensions();
    return (
      <div ref={measureRef}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={outerWidth}
          height={outerHeight}
          ref={node => (this.svgRef = node)}
        >
          <g
            transform={`translate(${theme.margin.left},${
              theme.margin.regionalTop
            })`}
          />
        </svg>
      </div>
    );
  }

  _dimensions() {
    const { contentRect } = this.props;
    const { width: outerWidth } = contentRect.bounds;
    const outerHeight = 200;
    return { outerWidth, outerHeight };
  }

  _render() {
    const { x, y } = this;
    const { data, title, start, end } = this.props;
    const { outerWidth, outerHeight } = this._dimensions();

    if (!outerWidth || !outerHeight) {
      return;
    }

    const width = outerWidth - theme.margin.right - theme.margin.left;
    const height =
      outerHeight - theme.margin.regionalTop - theme.margin.regionalBottom;

    const svg = d3.select(this.svgRef);
    const chart = svg.select('g');

    const significance = -Math.log10(5e-8);
    const [minLogPval, maxLogPval] = d3.extent(data, d => -Math.log10(d.pval));

    x.domain([start, end]).range([0, width]);
    y.domain([
      Math.min(significance, minLogPval),
      Math.max(significance, maxLogPval),
    ]).range([height, 0]);

    // const polygons = voronoi
    //   .x(d => x(d.studyId))
    //   .y(d => y(-Math.log10(d.pval)))
    //   .extent([[-1, -1], [width + 1, height + 1]])
    //   .polygons(assocs);

    // const traitCategoryRanges = getTraitCategoryRanges(assocs, x);
    // const traitPositions = traitCategoryRanges.map(
    //   range => (range.start + range.end) / 2
    // );
    // const traitCategories = traitCategoryRanges.map(
    //   category => category.traitCategory
    // );
    // categoryScale.domain(traitCategories).range(traitPositions);
    // colourScale.domain(traitCategories).range(d3.schemeCategory10);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // this._renderLegend(svg, outerWidth);
    this._renderLogPValueAxis(chart, yAxis);
    this._renderPositionAxis(chart, height, xAxis);
    this._renderSignificanceLine(chart, y, width, significance);
    this._renderDataPoints(chart, data);
    this._renderLabel(chart, title);
    // this._renderTraitLabels(chart, polygons, x, y, significance);
    // this._renderVoronoi(chart, polygons);
  }

  _renderLogPValueAxis(chart, yAxis) {
    let g = chart.select('.axis.axis--minus-log-pvalue');
    if (g.empty()) {
      g = chart.append('g').classed('axis axis--minus-log-pvalue', true);
    }
    g.call(yAxis);
    g.selectAll('.tick text').attr('fill', theme.axis.color);
    g.selectAll('.domain, .tick line').attr('stroke', theme.axis.color);

    let label = g.select('.axis-label.axis-label--minus-log-pvalue');

    if (label.empty()) {
      label = g
        .append('text')
        .attr('class', 'axis-label axis-label--minus-log-pvalue')
        .attr('transform', 'rotate(-90)')
        .attr('font-size', 12)
        .attr('dy', -40)
        .attr('text-anchor', 'end')
        .attr('fill', theme.axis.color)
        .text('-log₁₀(p-value)');
    }
  }

  _renderPositionAxis(chart, height, xAxis) {
    let g = chart.select('.axis.axis--studies');
    if (g.empty()) {
      g = chart.append('g').classed('axis axis--studies', true);
    }
    g.attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      // .attr('transform', 'rotate(45)')
      // .attr('x', 0)
      // .attr('y', 0)
      // .attr('dx', '.4em')
      // .attr('dy', '1.5em')
      .attr('fill', theme.axis.color);
    // .style('text-anchor', 'start');
    g.selectAll('.domain, .tick line').attr('stroke', theme.axis.color);
  }

  _renderSignificanceLine(chart, y, width, significance) {
    let significanceLine = chart.select('.significance');

    if (significanceLine.empty()) {
      significanceLine = chart.append('line').classed('significance', true);
    }

    significanceLine
      .attr('x1', 0)
      .attr('y1', y(significance))
      .attr('x2', width)
      .attr('y2', y(significance))
      .attr('stroke', theme.secondary);
  }

  _renderDataPoints(chart, data) {
    const { x, y } = this;

    const dataPoints = chart.selectAll('circle.point').data(data, d => d.id);

    dataPoints
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('stroke', theme.point.color)
      .attr('r', 3)
      .merge(dataPoints)
      .attr('cx', d => x(d.position))
      .attr('cy', d => y(-Math.log10(d.pval)))
      .attr(
        'fill',
        d =>
          d.is99CredibleSet
            ? posteriorProbabilityScale(d.posteriorProbability)
            : 'white'
      );

    dataPoints.exit().remove();
  }

  _renderLabel(chart, title) {
    let g = chart.select('.title');
    if (g.empty()) {
      g = chart.append('g').classed('title', true);
    }

    let label = g.select('text');

    if (label.empty()) {
      label = g
        .append('text')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('dy', -10)
        .attr('fill', theme.axis.color)
        .text(title);
    }
  }
}

export default withContentRect('bounds')(Regional);
