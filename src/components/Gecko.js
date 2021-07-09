import React from 'react';
import * as d3 from 'd3';
import { withContentRect } from 'react-measure';
import theme from './theme';

const GENE_SLOT_HEIGHT = 30;
const GENE_TRANSCRIPT_HEIGHT = 7;
const GENE_TRANSCRIPT_OFFSET = 2;
const GENE_BACKDROP_PADDING = 2;
const GENE_LABEL_OFFSET = GENE_TRANSCRIPT_OFFSET * 2 + GENE_TRANSCRIPT_HEIGHT;
const GENE_TRACK_PADDING = 5;
const STUDY_SLOT_HEIGHT = 30;
const STUDY_TEXT_MAX_WIDTH = 200;
const VARIANT_TRACK_HEIGHT = 7;
const CONNECTOR_TRACK_HEIGHT = 80;
const CHAR_WIDTH = 12; // TODO: base on font-size
const HEIGHT_DEFAULT = 400;

class Gecko extends React.Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
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
      <div ref={measureRef}>
        <svg width={width} height={height} ref={node => (this.svgRef = node)} />
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
    if (
      !width ||
      !data ||
      !data.tagVariants ||
      !data.genes ||
      !data.geneTagVariants
    ) {
      return HEIGHT_DEFAULT;
    }
    const scalePosition = d3
      .scaleLinear()
      .domain([start, end])
      .range([0, width]);

    const { slots: geneSlots } = this._geneSlots(scalePosition);
    const studySlotCount = this._studySlotCount(width);
    const trackConfig = this._trackConfig(geneSlots.length, studySlotCount);
    return trackConfig.height;
  }
  _dimensions() {
    const width = this._width();
    const height = this._height();
    return { width, height };
  }
  _render() {
    const { data, start, end } = this.props;
    const width = this._width();
    if (
      !width ||
      !data ||
      !data.tagVariants ||
      !data.genes ||
      !data.geneTagVariants
    ) {
      return null;
    }

    const svg = d3.select(this.svgRef);
    const scalePosition = d3
      .scaleLinear()
      .domain([start, end])
      .range([0, width]);

    const { slots: geneSlots, genesWithSlots } = this._geneSlots(scalePosition);
    const studySlotCount = this._studySlotCount(width);
    const trackConfig = this._trackConfig(geneSlots.length, studySlotCount);
    const { scaleStudyX, scaleStudyY } = this._studyScales(
      width,
      trackConfig.studies.height
    );

    this._renderGenes(svg, scalePosition, trackConfig.genes, genesWithSlots);
    this._renderTagVariants(
      svg,
      scalePosition,
      trackConfig.tagVariants,
      data.tagVariants
    );
    this._renderIndexVariants(
      svg,
      scalePosition,
      trackConfig.indexVariants,
      data.indexVariants
    );
    this._renderGeneTagVariants(
      svg,
      scalePosition,
      trackConfig.geneTagVariants,
      data.geneTagVariants
    );
    this._renderStudies(
      svg,
      scaleStudyX,
      scaleStudyY,
      trackConfig.studies,
      data.studies
    );
    this._renderTagVariantIndexVariantStudies(
      svg,
      scalePosition,
      scaleStudyX,
      trackConfig.tagVariantIndexVariants,
      trackConfig.indexVariantStudies,
      data.tagVariantIndexVariantStudies
    );
  }
  _renderGenes(svg, scale, track, data) {
    // render in own group
    let g = svg.select(`.track.track--genes`);
    if (g.empty()) {
      g = svg.append('g').classed('track track--genes', true);
    }
    g.attr('transform', `translate(0,${track.top})`);

    // join
    const genes = g.selectAll('g').data(data, d => d.id);

    // -------------
    // --- GENES ---
    // -------------

    // --- ENTER ---
    const enter = genes.enter().append('g');

    // vertical
    enter
      .append('line')
      .classed('vertical', true)
      .attr('stroke', theme.connector.color);

    // backdrop
    enter
      .append('rect')
      .classed('backdrop', true)
      .attr('fill', 'white')
      .attr('stroke', theme.line.color);

    // spit
    enter
      .append('line')
      .classed('spit', true)
      .attr('stroke', theme.line.color);

    // label
    enter
      .append('text')
      .classed('label', true)
      .attr('fill', theme.line.color)
      .attr('alignment-baseline', 'hanging')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12);

    // --- MERGE ---
    const merge = enter
      .merge(genes)
      .attr('transform', d => `translate(0,${d.slotIndex * GENE_SLOT_HEIGHT})`);

    // vertical
    merge
      .selectAll('line.vertical')
      .attr('x1', d => scale(d.tss))
      .attr('y1', GENE_TRANSCRIPT_OFFSET + GENE_TRANSCRIPT_HEIGHT / 2)
      .attr('x2', d => scale(d.tss))
      .attr('y2', d => track.height - d.slotIndex * GENE_SLOT_HEIGHT);

    // backdrop
    merge
      .selectAll('rect.backdrop')
      .attr('x', d => scale(d.start) - GENE_BACKDROP_PADDING)
      .attr('y', GENE_TRANSCRIPT_OFFSET - GENE_BACKDROP_PADDING)
      .attr('width', function(d) {
        const partnerText = d3.select(this.parentNode).select('text.label');
        const widthSpit = scale(d.end) - scale(d.start);
        const widthText = partnerText.node().getComputedTextLength();
        return Math.max(widthSpit, widthText) + GENE_BACKDROP_PADDING * 2;
      })
      .attr(
        'height',
        GENE_TRANSCRIPT_HEIGHT + CHAR_WIDTH + GENE_BACKDROP_PADDING * 2
      );

    // spit
    merge
      .selectAll('line.spit')
      .attr('x1', d => scale(d.start))
      .attr('y1', GENE_TRANSCRIPT_OFFSET + GENE_TRANSCRIPT_HEIGHT / 2)
      .attr('x2', d => scale(d.end))
      .attr('y2', GENE_TRANSCRIPT_OFFSET + GENE_TRANSCRIPT_HEIGHT / 2);

    // label
    merge
      .selectAll('text.label')
      .attr('x', d => scale(d.start))
      .attr('y', GENE_LABEL_OFFSET)
      .text(d => (d.start === d.tss ? `${d.symbol}>` : `<${d.symbol}`));

    // --- EXIT ---
    genes.exit().remove();

    // -------------
    // --- EXONS ---
    // -------------
    const exons = genes.selectAll('rect.exon').data(d => d.exons);

    exons
      .enter()
      .append('rect')
      .attr('stroke', theme.line.color)
      .attr('fill', 'white')
      .classed('exon', true)
      .merge(exons)
      .attr('x', d => scale(d[0]))
      .attr('y', GENE_TRANSCRIPT_OFFSET)
      .attr('width', d => scale(d[1]) - scale(d[0]))
      .attr('height', GENE_TRANSCRIPT_HEIGHT);

    exons.exit().remove();
  }
  _renderTagVariants(svg, scale, track, data) {
    // render in own group
    let g = svg.select(`.track.track--tag-variants`);
    if (g.empty()) {
      g = svg.append('g').classed('track track--tag-variants', true);
      g.append('rect');
    }
    g.attr('transform', `translate(0,${track.top})`);

    // backdrop
    g.select('rect')
      .attr('fill', theme.track.background)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', scale.range()[1] - scale.range()[0])
      .attr('height', track.height);

    // join
    const tags = g.selectAll('line').data(data);

    tags
      .enter()
      .append('line')
      .attr('stroke', theme.line.color)
      .attr('stroke-width', theme.line.thickness)
      .merge(tags)
      .attr('x1', d => scale(d.position))
      .attr('y1', 0)
      .attr('x2', d => scale(d.position))
      .attr('y2', track.height);

    tags.exit().remove();
  }
  _renderIndexVariants(svg, scale, track, data) {
    // render in own group
    let g = svg.select(`.track.track--index-variants`);
    if (g.empty()) {
      g = svg.append('g').classed('track track--index-variants', true);
      g.append('rect');
    }
    g.attr('transform', `translate(0,${track.top})`);

    // backdrop
    g.select('rect')
      .attr('fill', theme.track.background)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', scale.range()[1] - scale.range()[0])
      .attr('height', track.height);

    // join
    const tags = g.selectAll('line').data(data);

    tags
      .enter()
      .append('line')
      .attr('stroke', theme.line.color)
      .attr('stroke-width', theme.line.thickness)
      .merge(tags)
      .attr('x1', d => scale(d.position))
      .attr('y1', 0)
      .attr('x2', d => scale(d.position))
      .attr('y2', track.height);

    tags.exit().remove();
  }
  _renderStudies(svg, scaleX, scaleY, track, data) {
    // render in own group
    let g = svg.select(`.track.track--index-studies`);
    if (g.empty()) {
      g = svg.append('g').classed('track track--index-studies', true);
    }
    g.attr('transform', `translate(0,${track.top})`);

    // verticals
    const verticals = g.selectAll('line').data(data);

    verticals
      .enter()
      .append('line')
      .attr('stroke', theme.connector.color)
      .merge(verticals)
      .attr('x1', d => scaleX(d.studyId))
      .attr('y1', 0)
      .attr('x2', d => scaleX(d.studyId))
      .attr('y2', d => scaleY(d.studyId));

    verticals.exit().remove();

    // backdrops
    const backdrops = g.selectAll('rect').data(data);

    backdrops
      .enter()
      .append('rect')
      .attr('stroke', theme.line.color)
      .attr('fill', 'white')
      .merge(backdrops)
      .attr(
        'x',
        d =>
          scaleX(d.studyId) -
          (CHAR_WIDTH * d.studyId.length + 2 * GENE_BACKDROP_PADDING) / 2
      )
      .attr('y', d => scaleY(d.studyId))
      .attr(
        'width',
        d => CHAR_WIDTH * d.studyId.length + 2 * GENE_BACKDROP_PADDING
      )
      .attr('height', CHAR_WIDTH + 2 * GENE_BACKDROP_PADDING);

    backdrops.exit().remove();

    // pointers
    const pointers = g.selectAll('circle').data(data);

    pointers
      .enter()
      .append('circle')
      .attr('stroke', theme.line.color)
      .attr('fill', 'white')
      .merge(pointers)
      .attr('cx', d => scaleX(d.studyId))
      .attr('cy', d => scaleY(d.studyId))
      .attr('r', 2);

    pointers.exit().remove();

    // labels
    const texts = g.selectAll('text').data(data);

    texts
      .enter()
      .append('text')
      .attr('fill', theme.line.color)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .merge(texts)
      .attr('x', d => scaleX(d.studyId))
      .attr('y', d => scaleY(d.studyId) + CHAR_WIDTH)
      .text(d => d.studyId);

    texts.exit().remove();
  }
  _renderGeneTagVariants(svg, scale, track, data) {
    // render in own group
    let g = svg.select(`.track.track--gene-tag-variants`);
    if (g.empty()) {
      g = svg.append('g').classed('track track--gene-tag-variants', true);
    }
    g.attr('transform', `translate(0,${track.top})`);

    // join
    const tags = g.selectAll('path').data(data);

    tags
      .enter()
      .append('path')
      .attr('stroke', theme.connector.color)
      .attr('fill', 'none')
      .merge(tags)
      .attr('d', d => {
        const topX = scale(d.geneTss);
        const topY = 0;
        const bottomX = scale(d.tagVariantPosition);
        const bottomY = track.height;
        const controlY = (bottomY + topY) / 2;
        return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
      });

    tags.exit().remove();
  }
  _renderTagVariantIndexVariantStudies(
    svg,
    scaleGenome,
    scaleStudyX,
    tvIvTrack,
    ivSTrack,
    data
  ) {
    // render in own group
    let g = svg.select(`.track.track--tag-variant-index-variant-studies`);
    if (g.empty()) {
      g = svg
        .append('g')
        .classed('track track--tag-variant-index-variant-studies', true);
    }
    // g.attr('transform', `translate(0,${tvIvTrack.top})`);

    // join
    const tags = g.selectAll('path').data(data);

    tags
      .enter()
      .append('path')
      .attr(
        'stroke',
        d =>
          d.posteriorProbability
            ? theme.connector.finemappingColor
            : theme.connector.color
      )
      .attr('fill', 'none')
      .merge(tags)
      .attr('d', d => {
        // tag variant - index variant
        const tvIvTopX = scaleGenome(d.tagVariantPosition);
        const tvIvTopY = tvIvTrack.top;
        const tvIvBottomX = scaleGenome(d.indexVariantPosition);
        const tvIvBottomY = tvIvTrack.bottom;
        const tvIvControlY = (tvIvBottomY + tvIvTopY) / 2;

        // index variant - study
        const ivSTopX = scaleGenome(d.indexVariantPosition);
        const ivSTopY = ivSTrack.top;
        const ivSBottomX = scaleStudyX(d.studyId);
        const ivSBottomY = ivSTrack.bottom;
        const ivSControlY = (ivSBottomY + ivSTopY) / 2;

        // render path
        return `
          M${tvIvTopX},${tvIvTopY} C${tvIvTopX},${tvIvControlY}, ${tvIvBottomX},${tvIvControlY} ${tvIvBottomX},${tvIvBottomY}
          M${ivSTopX},${ivSTopY} C${ivSTopX},${ivSControlY}, ${ivSBottomX},${ivSControlY} ${ivSBottomX},${ivSBottomY}
        `;
      });

    tags.exit().remove();
  }
  _geneSlots(scale) {
    const { genes } = this.props.data;
    const sortedGenes = genes.slice().sort(function(a, b) {
      return a.start - b.start;
    });

    let slotCount = 0;
    const slots = [];
    const genesWithSlots = [];
    sortedGenes.forEach(gene => {
      const suitableSlots = slots.filter(
        slot =>
          scale(gene.start) > scale(slot.end) + gene.symbol.length * CHAR_WIDTH
      );
      if (suitableSlots.length > 0) {
        // store in slots
        suitableSlots[0].genes.push(gene);
        suitableSlots[0].end = gene.end;

        // store in gene list with slot index
        genesWithSlots.push({ ...gene, slotIndex: suitableSlots[0].index });
      } else {
        // store in slots
        const newSlot = { genes: [gene], end: gene.end, index: slotCount++ };
        slots.push(newSlot);

        // store in gene list with slot index
        genesWithSlots.push({ ...gene, slotIndex: newSlot.index });
      }
    });

    return { slots, genesWithSlots };
  }
  _studySlotCount(width) {
    const { studies } = this.props.data;
    const studiesPerSlot = Math.ceil(width / STUDY_TEXT_MAX_WIDTH);
    const slotCount = Math.ceil(studies.length / studiesPerSlot);
    return slotCount;
  }
  _studyScales(width, trackHeight) {
    const { studies } = this.props.data;
    const studiesPerSlot = Math.ceil(width / STUDY_TEXT_MAX_WIDTH);
    const slotCount = Math.ceil(studies.length / studiesPerSlot);
    const domain = studies
      .slice()
      .sort(function(a, b) {
        return a.traitReported - b.traitReported;
      })
      .map(d => d.studyId);
    const rangeX = [STUDY_TEXT_MAX_WIDTH / 2, width - STUDY_TEXT_MAX_WIDTH / 2];
    const rangeY = domain.map((d, i) => {
      const s = GENE_TRACK_PADDING;
      const e = trackHeight - 2 * GENE_TRACK_PADDING;
      return s + ((e - s) * (i % slotCount)) / slotCount;
    });
    const scaleStudyX = d3
      .scalePoint()
      .domain(domain)
      .range(rangeX);
    const scaleStudyY = d3
      .scaleOrdinal()
      .domain(domain)
      .range(rangeY);

    return { scaleStudyX, scaleStudyY };
  }
  _trackConfig(geneSlotCount, studySlotCount) {
    const geneTrackHeight =
      geneSlotCount * GENE_SLOT_HEIGHT + 2 * GENE_TRACK_PADDING;
    const genes = {
      top: 0,
      bottom: geneTrackHeight,
      height: geneTrackHeight,
    };
    const geneTagVariants = {
      top: genes.bottom,
      bottom: genes.bottom + CONNECTOR_TRACK_HEIGHT,
      height: CONNECTOR_TRACK_HEIGHT,
    };
    const tagVariants = {
      top: geneTagVariants.bottom,
      bottom: geneTagVariants.bottom + VARIANT_TRACK_HEIGHT,
      height: VARIANT_TRACK_HEIGHT,
    };
    const tagVariantIndexVariants = {
      top: tagVariants.bottom,
      bottom: tagVariants.bottom + CONNECTOR_TRACK_HEIGHT,
      height: CONNECTOR_TRACK_HEIGHT,
    };
    const indexVariants = {
      top: tagVariantIndexVariants.bottom,
      bottom: tagVariantIndexVariants.bottom + VARIANT_TRACK_HEIGHT,
      height: VARIANT_TRACK_HEIGHT,
    };
    const indexVariantStudies = {
      top: indexVariants.bottom,
      bottom: indexVariants.bottom + CONNECTOR_TRACK_HEIGHT,
      height: CONNECTOR_TRACK_HEIGHT,
    };
    const studyTrackHeight =
      studySlotCount * STUDY_SLOT_HEIGHT + 2 * GENE_TRACK_PADDING;
    const studies = {
      top: indexVariantStudies.bottom,
      bottom: indexVariantStudies.bottom + studyTrackHeight,
      height: studyTrackHeight,
    };
    return {
      genes,
      geneTagVariants,
      tagVariants,
      tagVariantIndexVariants,
      indexVariants,
      indexVariantStudies,
      studies,
      height: studies.bottom,
    };
  }
}

export default withContentRect('bounds')(Gecko);
