import queryString from 'query-string';
import { commaSeparate } from '../ot-ui-components';
import { chromosomesWithCumulativeLengths } from './chromosome';

const chromosomeDict = chromosomesWithCumulativeLengths.reduce((acc, d) => {
  acc[d.name] = d;
  return acc;
}, {});

const mb = 1000000;

export function parseGeneDescription(description = '') {
  if (!description) return null;
  const brIndex = description.indexOf('[');
  return description.slice(0, brIndex);
}

export function parseGeneLocation(chromosome, start, end) {
  if (!chromosome || !start || !end) return null;
  return `${chromosome}:${commaSeparate(start)}-${commaSeparate(end)}`;
}

export function parseGeneBioType(bioType = '') {
  if (!bioType) return null;
  return bioType.replaceAll('_', ' ');
}

export function getGeneLocusURL(locusParams) {
  const {
    start: startParam,
    end: endParam,
    chromosome,
    selectedGene,
  } = locusParams;
  if (!chromosome) return null;
  const rounded = Math.round((startParam + endParam) / 2);

  const chromosomeObj = chromosomeDict[chromosome];

  const start = rounded > mb ? rounded - mb : 0;
  const end =
    rounded <= chromosomeObj.length - mb
      ? rounded + mb
      : chromosomeObj.length - 1;

  const params = { chromosome, start, end, selectedGenes: selectedGene };

  return `/locus?${queryString.stringify(params)}`;
}
