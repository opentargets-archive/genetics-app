import * as FileSaver from 'file-saver';

const downloadPNG = ({
  canvasNode,
  filenameStem,
}: {
  canvasNode: HTMLCanvasElement;
  filenameStem: string;
}) => {
  if (!canvasNode) {
    console.info('Nothing to download.');
    return;
  }
  canvasNode.toBlob(blob => {
    if (!blob) {
      console.info('Failed to create blob from canvas element:');
      console.info(canvasNode);
      return;
    }
    FileSaver.saveAs(blob, `${filenameStem}.png`);
  });
};

export default downloadPNG;
