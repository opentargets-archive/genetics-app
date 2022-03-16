import React, { useState } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import {
  Autocomplete,
  DownloadSVGPlot,
  significantFigures,
  ListTooltip,
} from '../ot-ui-components';
import { Tooltip } from '@material-ui/core';
import Help from '@material-ui/icons/Help';
import { pvalThreshold } from '../constants';

function traitFilterOptions(data, selectedCategories) {
  // color scale
  let colorScale = d3
    .scaleOrdinal()
    .domain(selectedCategories)
    .range(d3.schemeCategory10);
  return _.sortBy(
    _.uniq(data.map(d => d.traitCategory)).map(d => {
      return {
        label: d,
        value: d,
        selected: selectedCategories.indexOf(d) >= 0,
        index: selectedCategories.indexOf(d),
        chipcolor: colorScale(d),
      };
    }),
    [d => !d.selected, 'index']
  );
}

const cfg = {
  component_width: 0,
  svgW: 1650,
  plotW: 1100,
  tableW: 500,
  traitnameW: 400,
  nTicks: 5,
  rowHeight: 26,
  minBoxSize: 5,
  maxBoxSize: 20,
  maxPlotHeight: 800,
  plotMargin: 78,
  treeColor: '#5A5F5F',
  evenRowColor: '#fff',
  unevenRowColor: '#f2f1f1',
};

const ForestPlot = ({
  data,
  refs,
  variantId,
  selectionHandler,
  selectedCategories,
  tooltipRows,
}) => {
  const [traits, setTraits] = useState([]);
  const [update, setUpdate] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [anchorData, setAnchorData] = useState(null);
  const [open, setOpen] = useState(false);

  function handleMouseLeave() {
    setOpen(false);
  }

  // update the plot if a new trait category is selected
  React.useEffect(
    () => {
      let selectedTraits = data.filter(
        d => selectedCategories.indexOf(d.traitCategory) >= 0
      );
      return setTraits(_.sortBy(selectedTraits, ['traitCategory', 'beta']));
    },
    [data, selectedCategories]
  );

  const plot_height =
    cfg.plotMargin + traits.length * cfg.rowHeight < cfg.maxPlotHeight
      ? cfg.plotMargin + traits.length * cfg.rowHeight
      : cfg.maxPlotHeight;

  // draw the plot
  React.useEffect(
    () => {
      // color scale
      let colorScale = d3
        .scaleOrdinal()
        .domain(selectedCategories)
        .range(d3.schemeCategory10);

      // box size scale
      let boxSizeScale = d3
        .scaleLog()
        .domain(d3.extent(traits, d => d.nTotal))
        .range([cfg.minBoxSize, cfg.maxBoxSize]);

      // clear svg
      d3.select(refs.current)
        .selectAll('*')
        .remove();
      d3.select('#topRow')
        .selectAll('*')
        .remove();
      d3.select('#bottomRow')
        .selectAll('*')
        .remove();

      // get component width
      cfg.component_width = d3
        .select(refs.current)
        .node()
        .parentNode.parentNode.getBoundingClientRect().width;

      // make plot scrollable
      d3.select(refs.current.parentNode)
        .attr('width', cfg.component_width)
        .style('overflow', 'auto')
        .style('position', 'relative');

      // timer is needed to make sure the right component width is taken (and not the width just a few frames before resizing is finished
      d3.select(window).on('resize', d => {
        d3.timer(d => {
          setUpdate(!update);
        }, 5);
      });

      // set svg size and create group element
      const svg = d3
        .select(refs.current)
        .attr('width', cfg.svgW)
        .attr('height', traits.length * cfg.rowHeight + 3 * cfg.rowHeight)
        .style('position', 'absolute')
        .append('g');

      // set top row svg size and sticky
      const topRowSvg = d3
        .select('#topRow')
        .attr('width', cfg.svgW - 45)
        .attr('height', cfg.rowHeight + 5)
        .style('position', 'sticky')
        .style('top', '0');

      // set bottom row svg size and sticky
      const bottomRowSvg = d3
        .select('#bottomRow')
        .attr('width', cfg.svgW)
        .attr('height', 2 * cfg.rowHeight)
        .style('position', 'sticky')
        .style('top', plot_height - 2 * cfg.rowHeight)
        .style('background-color', 'white');

      // clip trait name text (row width)
      svg
        .append('clipPath')
        .attr('id', 'clip1')
        .append('rect')
        .attr('height', cfg.rowHeight)
        .attr('width', cfg.traitnameW);

      // add top row of table
      topRowSvg
        .append('g')
        .classed('topRow', true)
        .append('rect')
        .attr('height', cfg.rowHeight)
        .attr('width', cfg.tableW)
        .attr('fill', cfg.unevenRowColor);

      // trait
      topRowSvg
        .select('.topRow')
        .append('text')
        .text('Trait')
        .attr('clip-path', 'url(#clip1)')
        .style('font-size', '17px')
        .style('font-family', 'sans-serif')
        .style('font-weight', 'bold')
        .attr('dy', (cfg.rowHeight - 15) / 2 + 11)
        .attr('dx', 8);

      // pval
      topRowSvg
        .select('.topRow')
        .append('text')
        .text('P-value')
        .style('font-size', '17px')
        .style('font-family', 'sans-serif')
        .style('font-weight', 'bold')
        .attr('dy', (cfg.rowHeight - 15) / 2 + 11)
        .attr('dx', cfg.traitnameW + 8);

      // add horizontal line to separate top row from other rows
      topRowSvg
        .append('line')
        .attr('x2', cfg.tableW)
        .attr('y1', cfg.rowHeight)
        .attr('y2', cfg.rowHeight)
        .attr('stroke', 'black');

      // add vertical line to separate trait and pval columns
      topRowSvg
        .append('line')
        .attr('x1', cfg.traitnameW)
        .attr('x2', cfg.traitnameW)
        .attr('y2', cfg.rowHeight)
        .attr('stroke', 'black');

      // create table
      let table = svg.append('g').attr('id', 'forestTable');

      // add vertical line to separate trait and pval columns
      table
        .append('line')
        .attr('x1', cfg.traitnameW)
        .attr('x2', cfg.traitnameW)
        .attr('y2', traits.length * cfg.rowHeight + cfg.rowHeight)
        .attr('stroke', 'black');

      // add rows to table
      let rows = table
        .selectAll('.row')
        .data(traits)
        .enter()
        .append('g')
        .classed('row', true)
        .attr(
          'transform',
          (d, i) => 'translate(0,' + cfg.rowHeight * (i + 1) + ')'
        );

      rows
        .append('rect')
        .attr('height', cfg.rowHeight)
        .attr('width', cfg.tableW)
        .attr(
          'fill',
          (d, i) => (i % 2 === 1 ? cfg.unevenRowColor : cfg.evenRowColor)
        );

      // trait name
      rows
        .append('text')
        .text(d => d.traitReported)
        .attr('clip-path', 'url(#clip1)')
        .style('font-size', '13px')
        .style('font-family', 'sans-serif')
        .attr('dy', (cfg.rowHeight - 15) / 2 + 11)
        .attr('dx', 8)
        .style('fill', d => colorScale(d.traitCategory))
        .append('title')
        .text(d => d.traitReported);

      // pval
      rows
        .append('text')
        .text(
          d =>
            d.pval < pvalThreshold
              ? `<${pvalThreshold}`
              : significantFigures(d.pval)
        )
        .style('font-size', '13px')
        .style('font-family', 'sans-serif')
        .attr('dy', (cfg.rowHeight - 15) / 2 + 11)
        .attr('dx', cfg.traitnameW + 8);

      // create the plot
      let plot = svg
        .append('g')
        .attr('id', 'forestPlot')
        .attr('transform', 'translate(' + cfg.tableW + ',0)');

      // set scale and axis
      const lowX = d3.min(traits, d => d.beta - 1.959964 * d.se);
      const highX = d3.max(traits, d => d.beta + 1.959964 * d.se);
      let x = d3
        .scaleLinear()
        .domain([lowX - Math.abs(0.1 * lowX), highX + Math.abs(0.1 * highX)])
        .range([0, cfg.plotW]);
      let xAxisBottom = d3.axisBottom(x).ticks(cfg.nTicks);
      let xAxisTop = d3.axisTop(x).ticks(cfg.nTicks);

      // add top row of plot
      let plotTop = topRowSvg
        .append('g')
        .attr(
          'transform',
          'translate(' + cfg.tableW + ',' + cfg.rowHeight + ')'
        );

      // axis background
      plotTop
        .append('rect')
        .attr('y', -cfg.rowHeight)
        .attr('width', cfg.plotW)
        .attr('height', cfg.rowHeight)
        .style('fill', 'white');

      // axis
      plotTop.call(xAxisTop).attr('class', 'axis');

      // axis color
      topRowSvg
        .select('.axis')
        .select('.domain')
        .style('stroke', cfg.treeColor);

      // axis tick color
      topRowSvg
        .select('.axis')
        .selectAll('.tick')
        .select('line')
        .style('stroke', cfg.treeColor)
        .style('stroke-opacity', d => (d === -0 ? '100%' : '50%'))
        .style('stroke-dasharray', d => (d === -0 ? 0 : 2));

      // axis tick text color
      topRowSvg
        .select('.axis')
        .selectAll('.tick')
        .select('text')
        .style('fill', cfg.treeColor);

      // create axis lines
      let axisLines = plot.append('g');
      topRowSvg
        .select('.axis')
        .selectAll('.tick')
        .select('line')
        .clone()
        .each((d, i, n) => {
          let transf = n[i].parentNode.attributes.transform.nodeValue;
          return axisLines
            .append(() => n[i])
            .attr('y2', traits.length * cfg.rowHeight + cfg.rowHeight)
            .attr('transform', transf);
        });

      // add bottom row of plot
      let plotBottom = bottomRowSvg
        .append('g')
        .attr('transform', 'translate(' + cfg.tableW + ', 0)');

      // axis background
      plotBottom
        .append('rect')
        .attr('width', cfg.plotW)
        .attr('height', cfg.rowHeight)
        .style('fill', 'white');

      // axis label
      plotBottom
        .call(xAxisBottom)
        .attr('class', 'axis')
        .append('g')
        .attr('transform', 'translate(0,' + (cfg.rowHeight + 10) + ')')
        .append('text')
        .text('Beta')
        .attr('fill', cfg.treeColor)
        .attr('text-anchor', 'middle')
        .attr('x', cfg.plotW / 2)
        .style('font-weight', 'bold')
        .style('font-size', 15);

      // axis color
      bottomRowSvg
        .select('.axis')
        .select('.domain')
        .style('stroke', cfg.treeColor);

      // axis tick color
      bottomRowSvg
        .select('.axis')
        .selectAll('.tick')
        .select('line')
        .style('stroke', cfg.treeColor)
        .style('stroke-opacity', d => (d === -0 ? '100%' : '50%'))
        .style('stroke-dasharray', d => (d === -0 ? 0 : 2));

      // axis tick text color
      bottomRowSvg
        .select('.axis')
        .selectAll('.tick')
        .select('text')
        .style('fill', cfg.treeColor);

      // create effect size groups(trees)
      let trees = plot
        .selectAll('.tree')
        .data(traits)
        .enter()
        .append('g')
        .classed('tree', true)
        .attr(
          'transform',
          (d, i) => 'translate(0,' + (i + 1) * cfg.rowHeight + ')'
        )
        .attr('id', (d, i) => i);

      // create confidence intervals
      trees
        .append('line')
        .attr('x1', d => x(d.beta - 1.959964 * d.se))
        .attr('x2', d => x(d.beta + 1.959964 * d.se))
        .attr('y1', cfg.rowHeight / 2)
        .attr('y2', cfg.rowHeight / 2)
        .attr('stroke-width', 1)
        .attr('stroke', d => colorScale(d.traitCategory));

      // create boxes
      trees
        .append('rect')
        .attr('x', d => x(d.beta) - boxSizeScale(d.nTotal) / 2)
        .attr('y', d => cfg.rowHeight / 2 - boxSizeScale(d.nTotal) / 2)
        .attr('fill', d => colorScale(d.traitCategory))
        .attr('width', d => boxSizeScale(d.nTotal))
        .attr('height', d => boxSizeScale(d.nTotal))
        .on('mouseover', (d, i, n) => {
          setAnchor(n[i]);
          setOpen(true);
          setAnchorData(d);
        });

      // place lines on top of table for correct rendering
      table.selectAll('line').raise();
    },
    [data, traits, selectedCategories, refs, update, plot_height]
  );

  // trait selection dropdown
  let dropdown = (
    <Autocomplete
      options={traitFilterOptions(data, selectedCategories)}
      value={traitFilterOptions(data, selectedCategories).filter(
        d => d.selected
      )}
      handleSelectOption={selectionHandler}
      placeholder="Add a trait category to compare..."
      multiple
      wide
    />
  );

  const dataList = anchorData
    ? tooltipRows.map(({ label, id, renderCell }) => ({
        label,
        value: renderCell ? renderCell(anchorData) : anchorData[id],
      }))
    : [];

  // combine all elements to create the forest plot container
  return (
    <DownloadSVGPlot
      left={dropdown}
      svgContainer={refs}
      filenameStem={`${variantId}-traits`}
    >
      <div
        onMouseLeave={handleMouseLeave}
        style={{
          width: cfg.component_width,
          height: plot_height,
          margin: 'none',
        }}
      >
        <svg ref={refs} />
        <Tooltip
          title={`The plot shows : beta for selected trait categories.`}
          placement={'top'}
          interactive={true}
        >
          <Help
            style={{
              fontSize: '1.6rem',
              paddingLeft: '0.6rem',
              color: 'rgba(0,0,0,0.54)',
              position: 'absolute',
            }}
            transform={`translate(${cfg.svgW - 40},0)`}
          />
        </Tooltip>
        <svg id="topRow" />
        <svg id="bottomRow" />
        <ListTooltip open={open} anchorEl={anchor} dataList={dataList} />
      </div>
    </DownloadSVGPlot>
  );
};

export default ForestPlot;
