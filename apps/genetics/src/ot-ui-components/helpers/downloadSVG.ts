import * as FileSaver from 'file-saver';

const downloadSVG = ({
  svgNode,
  filenameStem,
}: {
  svgNode: SVGElement;
  filenameStem: string;
}) => {
  if (!svgNode) {
    console.info('Nothing to download.');
    return;
  }

  const contentString = svgNode.outerHTML;
  const blob = new Blob([contentString], {
    type: 'application/svg+xml',
  });
  FileSaver.saveAs(blob, `${filenameStem}.svg`);
};

export default downloadSVG;
