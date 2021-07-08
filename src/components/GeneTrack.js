import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { withContentRect } from 'react-measure';
import theme from './theme';

const GENE_SLOT_HEIGHT = 25;
const GENE_TRANSCRIPT_HEIGHT = 5;
const GENE_TRANSCRIPT_OFFSET = 2;
const GENE_BACKDROP_PADDING = 2;
const GENE_TRACK_PADDING = 5;
const CHAR_HEIGHT = 12;
const HEIGHT_DEFAULT = 400;
const SCALE_FACTOR = 2;
const HIDDEN_TYPE_MAP = {
  gene: 1,
};
const HIDDEN_TYPE_MAP_INVERSE = {};
Object.keys(HIDDEN_TYPE_MAP).forEach(
  k => (HIDDEN_TYPE_MAP_INVERSE[HIDDEN_TYPE_MAP[k]] = k)
);

const color = (d, noSelectedEntities) =>
  d.selected
    ? theme.gecko.colorSelected
    : !noSelectedEntities && d.chained
      ? theme.gecko.colorChained
      : theme.gecko.color;
const backgroundColor = (d, noSelectedEntities) =>
  d.selected
    ? theme.gecko.backgroundColorSelected
    : !noSelectedEntities && d.chained
      ? theme.gecko.backgroundColorChained
      : theme.gecko.backgroundColor;

const wrapText = (text, maxLineWidth, measure) => {
  const lines = [];
  const spaceWidth = measure(' ');
  let wordsLeft = text.split(' ');
  let currentLine = '';
  let currentLineWidth = 0;
  let currentMaxLineWidth = 0;
  while (wordsLeft.length > 0) {
    const word = wordsLeft.shift();
    const wordWidth = measure(word);
    if (currentLineWidth + wordWidth < maxLineWidth) {
      // word fits on current line
      currentLine += (currentLineWidth > 0 ? ' ' : '') + word;
      currentLineWidth += (currentLineWidth > 0 ? spaceWidth : 0) + wordWidth;
      currentMaxLineWidth =
        currentLineWidth > currentMaxLineWidth
          ? currentLineWidth
          : currentMaxLineWidth;
    } else {
      if (wordWidth < maxLineWidth) {
        // word doesn't fit on line, but fits on next
        lines.push(currentLine);
        currentLine = word;
        currentLineWidth = wordWidth;
        currentMaxLineWidth =
          currentLineWidth > currentMaxLineWidth
            ? currentLineWidth
            : currentMaxLineWidth;
      } else {
        // word doesn't fit on a single line
        // TODO: wrap single word
        lines.push(currentLine);
        currentLine = word;
        currentLineWidth = wordWidth;
        currentMaxLineWidth =
          currentLineWidth > currentMaxLineWidth
            ? currentLineWidth
            : currentMaxLineWidth;
      }
    }
    // last word?
    if (wordsLeft.length === 0) {
      lines.push(currentLine);
    }
  }
  return {
    lines,
    width: currentMaxLineWidth,
  };
};

class GeneTrack extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.hiddenCanvasRef = React.createRef();
  }
  componentDidMount() {
    this._render();
  }
  componentDidUpdate() {
    this._render();
  }
  render() {
    const { measureRef } = this.props;
    const { width, height } = this._dimensions();
    return (
      <div
        ref={measureRef}
        style={{
          width: `100%`,
          height: `${height}px`,
          position: 'relative',
        }}
      >
        <canvas
          width={width ? width * SCALE_FACTOR : 0}
          height={height * SCALE_FACTOR}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          ref={node => (this.canvasRef = node)}
        />
        <canvas
          width={width ? width * SCALE_FACTOR : 0}
          height={height * SCALE_FACTOR}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            position: 'absolute',
            top: 0,
            left: 0,
            imageRendering: 'pixelated',
            opacity: 0,
          }}
          ref={node => (this.hiddenCanvasRef = node)}
        />
      </div>
    );
  }
  _width() {
    const { contentRect } = this.props;
    const { width } = contentRect.bounds;
    return width;
  }
  _height() {
    const { data, start, end } = this.props;
    const width = this._width();
    if (this._bail(data, width)) {
      return HEIGHT_DEFAULT;
    }
    const scalePosition = d3
      .scaleLinear()
      .domain([start, end])
      .range([
        theme.margin.left,
        width - theme.margin.left - theme.margin.right,
      ]);

    const { slots: geneSlots } = this._geneSlots(data.genes, scalePosition);
    const trackConfig = this._trackConfig(geneSlots.length);
    return trackConfig.height;
  }
  _dimensions() {
    const width = this._width();
    const height = this._height();
    return { width, height };
  }

  _bail(data, width) {
    return !width || !data || !data.genes;
  }
  _render() {
    const {
      data: rawData,
      start,
      end,
      // handleClick,
      // handleMousemove,
      // selectedGenes,
    } = this.props;
    const { colorMap, ...data } = this._generateHiddenColors(rawData);

    // const noSelectedEntities = !selectedGenes;
    const noSelectedEntities = true;

    const width = this._width();
    if (this._bail(data, width)) {
      return null;
    }

    const canvas = this.canvasRef;
    const context = canvas.getContext('2d');
    const hiddenCanvas = this.hiddenCanvasRef;
    const hiddenContext = hiddenCanvas.getContext('2d');

    // d3.select(hiddenCanvas).on('mousemove', function() {
    //   const point = d3.mouse(this);
    //   const [r, g, b, a] = hiddenContext.getImageData(
    //     Math.round(point[0]) * SCALE_FACTOR,
    //     Math.round(point[1]) * SCALE_FACTOR,
    //     1,
    //     1
    //   ).data;
    //   const color = `rgb(${r},${g},${b},${a})`;
    //   const item = colorMap[color];
    //   if (item) {
    //     const type = HIDDEN_TYPE_MAP_INVERSE[r >> 4];
    //     d3.select(hiddenCanvas).style('cursor', 'pointer');
    //     handleMousemove(item, type, point);
    //   } else {
    //     d3.select(hiddenCanvas).style('cursor', 'auto');
    //   }
    // });

    // d3.select(hiddenCanvas).on('click', function() {
    //   const point = d3.mouse(this);
    //   const [r, g, b, a] = hiddenContext.getImageData(
    //     Math.round(point[0]) * SCALE_FACTOR,
    //     Math.round(point[1]) * SCALE_FACTOR,
    //     1,
    //     1
    //   ).data;
    //   const color = `rgb(${r},${g},${b},${a})`;
    //   const item = colorMap[color];
    //   if (item) {
    //     const type = HIDDEN_TYPE_MAP_INVERSE[r >> 4];
    //     handleClick(item, type, point);
    //   }
    // });

    const scalePosition = d3
      .scaleLinear()
      .domain([start, end])
      .range([
        theme.margin.left,
        width - theme.margin.left - theme.margin.right,
      ]);

    const { slots: geneSlots, genesWithSlots } = this._geneSlots(
      data.genes,
      scalePosition
    );
    const trackConfig = this._trackConfig(geneSlots.length);

    context.save();
    context.imageSmoothingEnabled = true;
    context.scale(SCALE_FACTOR, SCALE_FACTOR);
    context.clearRect(0, 0, width, trackConfig.height);

    hiddenContext.save();
    hiddenContext.scale(SCALE_FACTOR, SCALE_FACTOR);
    hiddenContext.imageSmoothingEnabled = false;
    hiddenContext.webkitImageSmoothingEnabled = false;
    hiddenContext.mozImageSmoothingEnabled = false;
    hiddenContext.msImageSmoothingEnabled = false;
    hiddenContext.oImageSmoothingEnabled = false;
    hiddenContext.clearRect(0, 0, width, trackConfig.height);

    // clip
    context.rect(
      theme.margin.left,
      0,
      width - theme.margin.left - theme.margin.right,
      this._height()
    );
    context.clip();

    this._renderGenes(
      context,
      hiddenContext,
      scalePosition,
      trackConfig.genes,
      genesWithSlots,
      noSelectedEntities
    );

    context.restore();
    hiddenContext.restore();
  }

  _renderGenes(
    context,
    hiddenContext,
    scaleX,
    track,
    data,
    noSelectedEntities
  ) {
    context.save();
    context.translate(0, track.top + GENE_TRACK_PADDING);
    hiddenContext.save();
    hiddenContext.translate(0, track.top + GENE_TRACK_PADDING);

    // genes
    data.forEach(d => {
      const label = d.start === d.tss ? `${d.symbol}>` : `<${d.symbol}`;
      const textWidth = context.measureText(label).width;

      const backdropX = scaleX(d.start) - GENE_BACKDROP_PADDING;
      const backdropY =
        d.slotIndex * GENE_SLOT_HEIGHT +
        GENE_TRANSCRIPT_OFFSET -
        GENE_BACKDROP_PADDING;
      const backdropWidth =
        Math.max(textWidth, scaleX(d.end) - scaleX(d.start)) +
        GENE_BACKDROP_PADDING * 2;
      const backdropHeight =
        GENE_TRANSCRIPT_HEIGHT + CHAR_HEIGHT + GENE_BACKDROP_PADDING * 2;
      const spitY =
        d.slotIndex * GENE_SLOT_HEIGHT +
        GENE_TRANSCRIPT_OFFSET +
        GENE_TRANSCRIPT_HEIGHT / 2;

      // picker
      hiddenContext.fillStyle = d.hiddenColor;
      hiddenContext.fillRect(
        backdropX,
        backdropY,
        backdropWidth,
        backdropHeight
      );

      // backdrop
      context.fillStyle = backgroundColor(d, noSelectedEntities);
      context.strokeStyle = color(d, noSelectedEntities);
      context.fillRect(backdropX, backdropY, backdropWidth, backdropHeight);
      context.strokeRect(backdropX, backdropY, backdropWidth, backdropHeight);

      // spit
      context.beginPath();
      context.moveTo(scaleX(d.start), spitY);
      context.lineTo(scaleX(d.end), spitY);
      context.stroke();

      // exons
      d.exons.forEach(e => {
        const exonX = scaleX(e[[0]]);
        const exonY = d.slotIndex * GENE_SLOT_HEIGHT + GENE_TRANSCRIPT_OFFSET;
        const exonWidth = scaleX(e[[1]]) - exonX;
        const exonHeight = GENE_TRANSCRIPT_HEIGHT;
        context.fillRect(exonX, exonY, exonWidth, exonHeight);
        context.strokeRect(exonX, exonY, exonWidth, exonHeight);
      });

      // label
      const labelX = scaleX(d.start);
      const labelY =
        d.slotIndex * GENE_SLOT_HEIGHT +
        GENE_TRANSCRIPT_OFFSET * 2 +
        GENE_TRANSCRIPT_HEIGHT;
      context.textBaseline = 'hanging';
      context.fillStyle = color(d, noSelectedEntities);
      context.fillText(label, labelX, labelY);
    });

    context.restore();
    hiddenContext.restore();
  }
  _generateHiddenColors(data) {
    const { genes } = data;
    const colorMap = {};
    const genesWithHiddenColor = genes.map((d, i) => {
      const color = this._hiddenColor(i, 'gene');
      colorMap[color] = d;
      return { ...d, hiddenColor: color };
    });

    return {
      colorMap,
      genes: genesWithHiddenColor,
    };
  }
  _hiddenColor(entityId, type) {
    const typeId = HIDDEN_TYPE_MAP[type];
    const r = (typeId << 4) + (Math.floor(entityId / 65536) % 256);
    const g = Math.floor(entityId / 256) % 256;
    const b = entityId % 256;
    return `rgb(${r},${g},${b},255)`;
  }
  _geneSlots(genes, scale) {
    const sortedGenes = _.sortBy(genes.slice(), d => d.start);
    const canvas = this.canvasRef;
    const context = canvas.getContext('2d');

    let slotCount = 0;
    const slots = [];
    const genesWithSlots = [];
    const endOfGene = gene => {
      const transcriptLength = scale(gene.end) - scale(gene.start);
      const labelLength = context.measureText(gene.symbol + '>').width;
      return transcriptLength > labelLength
        ? scale.invert(scale(gene.end) + GENE_BACKDROP_PADDING * 3)
        : scale.invert(
            scale(gene.start) + labelLength + GENE_BACKDROP_PADDING * 3
          );
    };
    sortedGenes.forEach(gene => {
      const sortedSlots = _.sortBy(slots, d => d.index);
      const suitableSlots = sortedSlots.filter(slot => gene.start > slot.end);
      if (suitableSlots.length > 0) {
        // store in slots
        suitableSlots[0].genes.push(gene);

        // update slot end
        suitableSlots[0].end = endOfGene(gene);

        // store in gene list with slot index
        genesWithSlots.push({ ...gene, slotIndex: suitableSlots[0].index });
      } else {
        // store in slots
        const newSlot = {
          genes: [gene],
          end: endOfGene(gene),
          index: slotCount++,
        };
        slots.push(newSlot);

        // store in gene list with slot index
        genesWithSlots.push({ ...gene, slotIndex: newSlot.index });
      }
    });

    return { slots, genesWithSlots };
  }
  _trackConfig(geneSlotCount) {
    const geneTrackHeight =
      geneSlotCount * GENE_SLOT_HEIGHT + 2 * GENE_TRACK_PADDING;
    const genes = {
      top: 0,
      bottom: geneTrackHeight,
      height: geneTrackHeight,
    };
    return {
      genes,
      height: genes.bottom,
    };
  }
  _wrapText(context, text, maxWidth, textStyle = '10px sans-serif') {
    if (textStyle) {
      context.font = textStyle;
    }
    const { lines, width } = wrapText(
      text,
      maxWidth,
      str => context.measureText(str).width
    );
    return { lineArray: lines, width };
  }
}

export default withContentRect('bounds')(GeneTrack);
