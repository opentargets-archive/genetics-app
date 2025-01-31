import React, { useState } from 'react';
import _ from 'lodash';
import {
  scaleOrdinal,
  scaleLinear,
  scaleLog,
  schemeCategory10,
  extent,
  select,
  timer,
  min,
  max,
  axisBottom,
  axisTop,
} from 'd3';
import {
  Autocomplete,
  DownloadSVGPlot,
  significantFigures,
  ListTooltip,
} from '../../../ot-ui-components';
import { Tooltip } from '@material-ui/core';
import Help from '@material-ui/icons/Help';
import { pvalThreshold } from '../../../constants';

function traitFilterOptions(data, selectedCategories) {
  let all_categories = _.sortBy(_.uniq(data.map(d => d.traitCategory)), d => d);
  // color scale
  let colorScale = scaleOrdinal()
    .domain(all_categories)
    .range(schemeCategory10);
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
  top_axis: 27,
  bottom_axis: 52,
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
  React.useEffect(() => {
    let selectedTraits = data.filter(
      d => selectedCategories.indexOf(d.traitCategory) >= 0
    );
    return setTraits(_.sortBy(selectedTraits, ['traitCategory', 'beta']));
  }, [data, selectedCategories]);

  const plot_height =
    traits.length * cfg.rowHeight + cfg.top_axis + cfg.bottom_axis <
    cfg.maxPlotHeight
      ? traits.length * cfg.rowHeight + cfg.top_axis + cfg.bottom_axis
      : cfg.maxPlotHeight;

  // draw the plot
  React.useEffect(() => {
    // color scale
    let all_categories = _.sortBy(
      _.uniq(data.map(d => d.traitCategory)),
      d => d
    );
    let colorScale = scaleOrdinal()
      .domain(all_categories)
      .range(schemeCategory10);

    // box size scale
    let boxSizeScale = scaleLog()
      .domain(extent(traits, d => d.nTotal))
      .range([cfg.minBoxSize, cfg.maxBoxSize]);

    // clear svg
    select(refs.current).selectAll('*').remove();
    select('#topRow').selectAll('*').remove();
    select('#topRowTable').selectAll('*').remove();
    select('#bottomRow').selectAll('*').remove();
    select('#table').selectAll('*').remove();

    // get component width
    cfg.component_width = select(refs.current)
      .node()
      .parentNode.parentNode.getBoundingClientRect().width;

    // make plot scrollable
    select(refs.current.parentNode)
      .attr('width', cfg.component_width)
      .style('overflow', 'auto')
      .style('position', 'relative');

    // timer is needed to make sure the right component width is taken (and not the width just a few frames before resizing is finished
    select(window).on('resize', d => {
      timer(d => {
        setUpdate(!update);
      }, 5);
    });

    // set svg size and create group element
    const svg = select(refs.current)
      .attr('width', cfg.svgW)
      .attr('height', traits.length * cfg.rowHeight + 2 * cfg.rowHeight)
      .style('position', 'absolute')
      .style('top', `${cfg.top_axis}px`)
      .append('g');

    // set top row svg size and sticky
    const topRowSvg = select('#topRow')
      .attr('width', cfg.svgW - 45)
      .attr('height', cfg.top_axis)
      .style('position', 'absolute')
      .style('flex-shrink', 0)
      .style('flex-grow', 0)
      .style('top', '0')
      .style('z-index', '2');

    // set top row table size and sticky
    const topRowTable = select('#topRowTable')
      .attr('width', cfg.tableW)
      .attr('height', cfg.top_axis)
      .style('position', 'sticky')
      .style('flex-shrink', 0)
      .style('flex-grow', 0)
      .style('left', '0')
      .style('z-index', '3');

    // set bottom row svg size and sticky
    const bottomRowSvg = select('#bottomRow')
      .attr('width', cfg.svgW)
      .attr('height', 2 * cfg.rowHeight)
      .style('position', 'sticky')
      .style('flex-shrink', 0)
      .style('flex-grow', 0)
      .style('top', `${plot_height - 2 * cfg.rowHeight}px`)
      .style('background-color', 'white');

    // clip trait name text (row width)
    svg
      .append('clipPath')
      .attr('id', 'clip1')
      .append('rect')
      .attr('height', cfg.rowHeight)
      .attr('width', cfg.traitnameW);

    // add top row of table
    topRowTable
      .append('g')
      .classed('topRowTable', true)
      .append('rect')
      .attr('height', cfg.rowHeight)
      .attr('width', cfg.tableW)
      .attr('fill', cfg.unevenRowColor);

    // trait
    topRowTable
      .select('.topRowTable')
      .append('text')
      .text('Trait')
      .attr('clip-path', 'url(#clip1)')
      .style('font-size', '1rem')
      .style('font-family', '"Inter", sans-serif')
      .style('fill', '#5A5F5F')
      .attr('dy', (cfg.rowHeight - 15) / 2 + 11)
      .attr('dx', 8);

    // pval
    topRowTable
      .select('.topRowTable')
      .append('text')
      .text('P-value')
      .style('font-size', '1rem')
      .style('font-family', '"Inter", sans-serif')
      .style('fill', '#5A5F5F')
      .attr('dy', (cfg.rowHeight - 15) / 2 + 11)
      .attr('dx', cfg.traitnameW + 8);

    // add horizontal line to separate top row from other rows
    topRowTable
      .append('line')
      .attr('x2', cfg.tableW)
      .attr('y1', cfg.rowHeight)
      .attr('y2', cfg.rowHeight)
      .attr('stroke', 'black');

    // add vertical line to separate trait and pval columns
    topRowTable
      .append('line')
      .attr('x1', cfg.traitnameW)
      .attr('x2', cfg.traitnameW)
      .attr('y2', cfg.rowHeight)
      .attr('stroke', 'black');

    // create table
    const table = select('#table')
      .attr('width', 500)
      .attr('height', traits.length === 0 ? 0 : cfg.rowHeight)
      .style('position', 'sticky')
      .style('left', '0')
      .style('overflow', 'visible');

    // add vertical line to separate trait and pval columns
    table
      .append('line')
      .attr('x1', cfg.traitnameW)
      .attr('x2', cfg.traitnameW)
      .attr('y2', traits.length * cfg.rowHeight)
      .attr('stroke', 'black');

    // add rows to table
    let rows = table
      .selectAll('.row')
      .data(traits)
      .enter()
      .append('g')
      .classed('row', true)
      .attr('transform', (d, i) => 'translate(0,' + cfg.rowHeight * i + ')');

    rows
      .append('rect')
      .attr('height', cfg.rowHeight)
      .attr('width', cfg.tableW)
      .attr('fill', (d, i) =>
        i % 2 === 1 ? cfg.unevenRowColor : cfg.evenRowColor
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
      .text(d =>
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
    const lowX = min(traits, d => d.beta - 1.959964 * d.se);
    const highX = max(traits, d => d.beta + 1.959964 * d.se);
    let x = scaleLinear()
      .domain([lowX - Math.abs(0.1 * lowX), highX + Math.abs(0.1 * highX)])
      .range([0, cfg.plotW]);
    let xAxisBottom = axisBottom(x).ticks(cfg.nTicks);
    let xAxisTop = axisTop(x).ticks(cfg.nTicks);

    // add top row of plot
    let plotTop = topRowSvg
      .append('g')
      .attr('transform', 'translate(' + cfg.tableW + ',' + cfg.rowHeight + ')');

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
    topRowSvg.select('.axis').select('.domain').style('stroke', cfg.treeColor);

    // axis tick color
    topRowSvg
      .select('.axis')
      .selectAll('.tick')
      .select('line')
      .style('stroke', cfg.treeColor)
      .style('stroke-opacity', d => (d === 0 ? '100%' : '50%'))
      .style('stroke-dasharray', d => (d === 0 ? 0 : 2));

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
      .style('font-size', '15px')
      .style('font-family', '"Inter", sans-serif');

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
      .style('stroke-opacity', d => (d === 0 ? '100%' : '50%'))
      .style('stroke-dasharray', d => (d === 0 ? 0 : 2));

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
      .attr('transform', (d, i) => 'translate(0,' + i * cfg.rowHeight + ')')
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
  }, [data, traits, selectedCategories, refs, update, plot_height]);

  // trait selection dropdown
  let dropdown = (
    <Autocomplete
      options={traitFilterOptions(data, selectedCategories)}
      value={traitFilterOptions(data, selectedCategories).filter(
        d => d.selected
      )}
      handleSelectOption={selectionHandler}
      // placeholder="Add a trait category to compare..."
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
          display: 'flex',
          flexDirection: 'column',
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
        <div
          style={{
            position: 'sticky',
            top: '0px',
            display: 'flex',
            flexDirection: 'row',
            zIndex: 2,
            width: cfg.svgW - 45,
          }}
        >
          <svg id="topRowTable" />
          <svg id="topRow" />
        </div>
        <svg id="table" />
        <svg id="bottomRow" />
        <ListTooltip open={open} anchorEl={anchor} dataList={dataList} />
      </div>
    </DownloadSVGPlot>
  );
};

export default ForestPlot;
