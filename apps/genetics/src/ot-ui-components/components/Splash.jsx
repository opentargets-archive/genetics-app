import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as d3 from 'd3';
import { withContentRect } from 'react-measure';

const styles = theme => ({
  splash: {
    left: 0,
    top: 0,
    backgroundColor: theme.palette.primary.main,
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: -1,
  },
  svg: {
    position: 'fixed',
  },
});

const DATA = [];
const uniformGenerator = d3.randomUniform();
for (let i = 0; i < 250; i++) {
  DATA.push([uniformGenerator(), uniformGenerator()]);
}

class Splash extends React.Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
  }
  componentDidMount() {
    this._renderVoronoi();
  }
  componentDidUpdate() {
    this._renderVoronoi();
  }
  render() {
    const { classes, measureRef } = this.props;
    return (
      <div className={classes.splash} ref={measureRef}>
        <svg className={classes.svg} ref={node => (this.svgRef = node)} />
      </div>
    );
  }
  _dimensions() {
    const { contentRect } = this.props;
    const { width, height } = contentRect.bounds;
    return { width, height };
  }
  _renderVoronoi() {
    const svg = d3.select(this.svgRef);
    const { width, height } = this._dimensions();

    // scale data and svg to parent dims
    const data = DATA.map(d => [d[0] * width, d[1] * height]);
    svg.attr('width', width).attr('height', height);

    // create voronoi generator
    const voronoi = d3.voronoi().extent([
      [-1, -1],
      [width, height],
    ]);

    // join
    const pointsVoronoi = svg.selectAll('path').data(voronoi.polygons(data));

    pointsVoronoi
      .enter()
      .append('path')
      .attr('stroke', 'rgba(232, 232, 232, 0.6)')
      .attr('stroke-opacity', 0.3)
      .attr('fill', 'none')
      .merge(pointsVoronoi)
      .attr('d', function (d) {
        return d ? 'M' + d.join('L') + 'Z' : null;
      });

    pointsVoronoi.exit().remove();
  }
}

export default withStyles(styles)(withContentRect('bounds')(Splash));
