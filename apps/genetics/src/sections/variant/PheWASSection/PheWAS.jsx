import React, { Component } from 'react';
import {
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  voronoi,
  select,
  extent,
  axisBottom,
  axisLeft,
  schemeCategory10,
  symbol,
  symbolTriangle,
  polygonArea,
  polygonCentroid,
} from 'd3';
import _ from 'lodash';
import { withContentRect } from 'react-measure';

import theme from '../../../components/theme';

const getTraitCategoryRanges = (assocs, x) => {
  return assocs.reduce((acc, assoc) => {
    if (
      acc.length === 0 ||
      acc[acc.length - 1].traitCategory !== assoc.traitCategory
    ) {
      acc.push({
        traitCategory: assoc.traitCategory,
        start: x(assoc.studyId),
        end: x(assoc.studyId),
      });
      return acc;
    }

    const prev = acc[acc.length - 1];
    prev.start = Math.min(prev.start, x(assoc.studyId));
    prev.end = Math.max(prev.end, x(assoc.studyId));
    return acc;
  }, []);
};

const orient = {
  top: text => text.attr('text-anchor', 'middle').attr('y', -6),
  right: text =>
    text.attr('text-anchor', 'start').attr('dy', '0.35em').attr('x', 6),
  bottom: text =>
    text.attr('text-anchor', 'middle').attr('dy', '0.71em').attr('y', 6),
  left: text =>
    text.attr('text-anchor', 'end').attr('dy', '0.35em').attr('x', -6),
};

class PheWAS extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.x = scaleBand();
    this.y = scaleLinear();
    this.colourScale = scaleOrdinal();
    this.categoryScale = scaleOrdinal();
    this.voronoi = voronoi();
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
            transform={`translate(${theme.margin.left},${theme.margin.phewasTop})`}
          />
        </svg>
      </div>
    );
  }

  _dimensions() {
    const { contentRect } = this.props;
    const { width: outerWidth } = contentRect.bounds;
    const outerHeight = 440;
    return { outerWidth, outerHeight };
  }

  _render() {
    const { x, y, colourScale, categoryScale, voronoi } = this;
    const { associations, handleMouseover, significancePVal } = this.props;
    const { outerWidth, outerHeight } = this._dimensions();

    if (!outerWidth || !outerHeight) {
      return;
    }

    const width = outerWidth - theme.margin.right - theme.margin.left;
    const height = outerHeight - theme.margin.top - theme.margin.phewasBottom;

    const assocs = _.sortBy(associations, ['traitCategory']);

    const svg = select(this.svgRef);
    const chart = svg.select('g');

    const significance = -Math.log10(
      significancePVal ? significancePVal : 0.05 / assocs.length
    );
    const [minLogPval, maxLogPval] = extent(
      assocs,
      assoc => -Math.log10(assoc.pval)
    );

    x.domain(assocs.map(assoc => assoc.studyId)).range([0, width]);
    y.domain([
      Math.min(significance, minLogPval),
      Math.max(significance, maxLogPval),
    ]).range([height, 0]);

    const polygons = voronoi
      .x(d => x(d.studyId))
      .y(d => y(-Math.log10(d.pval)))
      .extent([
        [-1, -1],
        [width + 1, height + 1],
      ])
      .polygons(assocs);

    const traitCategoryRanges = getTraitCategoryRanges(assocs, x);
    const traitPositions = traitCategoryRanges.map(
      range => (range.start + range.end) / 2
    );
    const traitCategories = traitCategoryRanges.map(
      category => category.traitCategory
    );
    categoryScale.domain(traitCategories).range(traitPositions);
    colourScale.domain(traitCategories).range(schemeCategory10);

    const xAxis = axisBottom(categoryScale);
    const yAxis = axisLeft(y);

    this._renderLegend(svg, outerWidth);
    this._renderLogPValueAxis(chart, yAxis);
    this._renderStudiesAxis(chart, height, xAxis, colourScale);
    this._renderSignificanceLine(chart, y, width, significance);
    this._renderDataPoints(chart, assocs, colourScale, handleMouseover);
    this._renderTraitLabels(chart, polygons, x, y, significance);
  }

  _renderLegend(svg, width) {
    let g = svg.select('.legend');
    let rect = svg.select('.legend rect');

    if (g.empty()) {
      const trianglePath = symbol().size(32).type(symbolTriangle);

      g = svg
        .append('g')
        .attr('class', 'legend')
        .style('font', '12px sans-serif');
      rect = g
        .append('rect')
        .attr('height', theme.legend.height)
        .attr('fill', '#fff');
      // .attr('fill', theme.legend.backgroundColor);

      g.append('path')
        .attr('d', trianglePath)
        .attr('fill', theme.axis.color)
        .attr('transform', 'translate(100, 25)');

      g.append('text')
        .attr('fill', theme.axis.color)
        .attr('transform', 'translate(110 28)')
        .text('Positive Beta');

      g.append('path')
        .attr('d', trianglePath)
        .attr('fill', theme.axis.color)
        .attr('transform', 'translate(230, 22) rotate(180)');

      g.append('text')
        .attr('fill', theme.axis.color)
        .attr('transform', 'translate(240, 28)')
        .text('Negative Beta');
    }

    rect.attr('width', width);
  }

  _renderStudiesAxis(chart, height, xAxis, colourScale) {
    let g = chart.select('.axis.axis--studies');
    if (g.empty()) {
      g = chart.append('g').classed('axis axis--studies', true);
    }
    g.attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(45)')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dx', '.4em')
      .attr('dy', '1.5em')
      .attr('fill', function (d) {
        return colourScale(d);
      })
      .style('text-anchor', 'start');
    g.selectAll('.domain, .tick line').attr('stroke', theme.axis.color);
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

  _renderDataPoints(chart, assocs, colourScale, handleMouseover) {
    const { x, y } = this;
    const trianglePath = symbol().size(32).type(symbolTriangle);

    const dataPoints = chart
      .selectAll('path.point')
      .data(assocs, assoc => assoc.studyId);

    dataPoints
      .enter()
      .append('path')
      .attr('class', function (assoc) {
        return `point loci-${assoc.studyId}`;
      })
      .attr('fill', function (assoc) {
        return colourScale(assoc.traitCategory);
      })
      .attr('data-colour', function (assoc) {
        return colourScale(assoc.traitCategory);
      })
      .attr('d', trianglePath)
      .merge(dataPoints)
      .attr('transform', function (assoc) {
        const xPos = x(assoc.studyId);
        const yPos = y(-Math.log10(assoc.pval));
        const rotation = assoc.beta < 0 ? ',rotate(180)' : '';
        return `translate(${xPos},${yPos})${rotation}`;
      })
      .on('mouseover', handleMouseover);

    dataPoints.exit().remove();
  }

  _renderTraitLabels(chart, polygons, x, y, significance) {
    let g = select('.trait-labels');

    if (g.empty()) {
      g = chart
        .append('g')
        .attr('class', 'trait-labels')
        .style('font', '10px sans-serif');
    }

    const traitLabels = g.selectAll('text').data(
      polygons.filter(d => {
        return polygonArea(d) > 2000 && -Math.log10(d.data.pval) > significance;
      })
    );

    traitLabels
      .enter()
      .append('text')
      .merge(traitLabels)
      .each(function (d) {
        const [cx, cy] = polygonCentroid(d);
        const xPos = x(d.data.studyId);
        const yPos = y(-Math.log10(d.data.pval));
        // find angle between vector, going from the point that generates
        // the voronoi cell to the centroid of the cell, and the x axis
        const angle = Math.round(
          (Math.atan2(cy - yPos, cx - xPos) / Math.PI) * 2
        );
        select(this).call(
          angle === 0
            ? orient.right
            : angle === -1
            ? orient.top
            : angle === 1
            ? orient.bottom
            : orient.left
        );
      })
      .attr('fill', theme.axis.color)
      .attr('transform', d => {
        const xPos = x(d.data.studyId);
        const yPos = y(-Math.log10(d.data.pval));
        return `translate(${xPos},${yPos})`;
      })
      .text(d => {
        const { traitReported } = d.data;
        return traitReported
          ? traitReported.length <= 30
            ? traitReported
            : `${traitReported.slice(0, 30)}...`
          : 'Unknown trait';
      });

    traitLabels.exit().remove();
  }
}

PheWAS.defaultProps = {
  handleMouseover: () => {},
};

export default withContentRect('bounds')(PheWAS);
