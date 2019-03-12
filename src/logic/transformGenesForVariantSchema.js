import React from 'react';

// TODO: this data should be part of the API response
const SOURCE_MAP = {
  canonical_tss: {
    sourceLabel: 'Distance (Canonical TSS)',
    sourceDescriptionOverview:
      'Distance from the variant to canonical transcript TSS (base pairs).',
    sourceDescriptionBreakdown:
      'Distance from the variant to canonical transcript TSS (base pairs).',
    pmid: null,
  },
  gtex_v7: {
    sourceLabel: 'eQTL (GTEx V7)',
    sourceDescriptionOverview: (
      <React.Fragment>
        Summary of evidence linking this variant to gene expression in{' '}
        <i>any</i> of the 44 GTEx V7 tissues. See <b>eQTL (GTEx V7)</b> tab for
        tissue breakdown.
      </React.Fragment>
    ),
    sourceDescriptionBreakdown:
      'Evidence linking this variant to gene expression in each of the 44 GTEx V7 tissues.',
    pmid: '29022597',
  },
  sun2018: {
    sourceLabel: 'pQTL (Sun, 2018)',
    sourceDescriptionOverview:
      'Summary of evidence linking this variant to protein abundance in blood plasma.',
    sourceDescriptionBreakdown: (
      <React.Fragment>
        Evidence linking this variant to protein abundance in Sun <i>et al.</i>{' '}
        (2018) pQTL data.
      </React.Fragment>
    ),
    pmid: '29875488',
  },
  thurman2012: {
    sourceLabel: 'DHS-promoter corr (Thurman, 2012)',
    sourceDescriptionOverview:
      'Summary of evidence linking this variant to genes using correlation of DNase I hypersensitive site and gene promoters across 125 cell and tissue types from ENCODE.',
    sourceDescriptionBreakdown:
      'Evidence linking this variant to genes using correlation of DNase I hypersensitive site and gene promoters across 125 cell and tissue types from ENCODE.',
    pmid: '22955617',
  },
  andersson2014: {
    sourceLabel: 'Enhancer-TSS corr (FANTOM5)',
    sourceDescriptionOverview:
      'Summary of evidence linking this variant to genes using correlation between the transcriptional activity of enhancers and transcription start sites using the FANTOM5 CAGE expression atlas.',
    sourceDescriptionBreakdown:
      'Evidence linking this variant to genes using correlation between the transcriptional activity of enhancers and transcription start sites using the FANTOM5 CAGE expression atlas.',
    pmid: '24670763',
  },
  javierre2016: {
    sourceLabel: 'PCHi-C (Javierre, 2016)',
    sourceDescriptionOverview: (
      <React.Fragment>
        Summary of evidence linking this variant to genes using Promoter Capture
        Hi-C in <i>any</i> of the 17 human primary hematopoietic cell types.
      </React.Fragment>
    ),
    sourceDescriptionBreakdown:
      'Evidence linking this variant to genes using Promoter Capture Hi-C in each of the 17 human primary hematopoietic cell types.',
    pmid: '27863249',
  },
  vep: {
    sourceLabel: 'VEP (Ensembl)',
    sourceDescriptionOverview:
      "Most severe coding sequence consequence(s) from Ensembl's Variant Effect Predictor.",
    sourceDescriptionBreakdown:
      "Most severe coding sequence consequence(s) from Ensembl's Variant Effect Predictor.",
    pmid: '27268795',
  },
};

const transformGenesForVariantSchema = schema => {
  const { distances, qtls, intervals, functionalPredictions } = schema;
  return {
    distances: distances.map(d => ({ ...d, ...SOURCE_MAP[d.sourceId] })),
    qtls: qtls.map(d => ({ ...d, ...SOURCE_MAP[d.sourceId] })),
    intervals: intervals.map(d => ({ ...d, ...SOURCE_MAP[d.sourceId] })),
    functionalPredictions: functionalPredictions.map(d => ({
      ...d,
      ...SOURCE_MAP[d.sourceId],
    })),
  };
};

export default transformGenesForVariantSchema;
