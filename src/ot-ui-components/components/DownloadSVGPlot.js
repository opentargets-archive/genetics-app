import React from 'react';
import { findDOMNode } from 'react-dom';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import downloadSVG from '../helpers/downloadSVG';
import PlotContainer from './PlotContainer';

const handleSVGDownload = (svgContainer, filenameStem) => {
  const node = findDOMNode(svgContainer.current);
  const svgNode = node.nodeName === 'svg' ? node : node.querySelector('svg');
  downloadSVG({ svgNode, filenameStem });
};

const DownloadSVGPlot = ({
  loading,
  error,
  left,
  center,
  svgContainer,
  filenameStem,
  reportDownloadEvent,
  children,
}) => (
  <PlotContainer
    loading={loading}
    error={error}
    left={left}
    center={center}
    right={
      <Grid container justify="flex-end" spacing={8}>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => {
              if (reportDownloadEvent) {
                reportDownloadEvent();
              }
              handleSVGDownload(svgContainer, filenameStem);
            }}
          >
            SVG
          </Button>
        </Grid>
      </Grid>
    }
  >
    {children}
  </PlotContainer>
);

export default DownloadSVGPlot;
