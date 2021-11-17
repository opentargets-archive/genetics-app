import FileSaver from 'file-saver';

const downloadPNG = ({ canvasNode, filenameStem }) => {
  if (!canvasNode) {
    console.info('Nothing to download.');
    return;
  }
  canvasNode.toBlob(blob => {
    FileSaver.saveAs(blob, `${filenameStem}.png`);
  });
};

export default downloadPNG;
