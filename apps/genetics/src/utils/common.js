import { format } from 'd3-format';

/* 
Example usage:
const comparatorDiseaseName = generateComparator(d => d.disease.name);
 */
export const generateComparator = accessor => (a, b) => {
  const aValue = accessor(a);
  const bValue = accessor(b);
  return aValue > bValue ? 1 : aValue === bValue ? 0 : -1;
};

export const getData = (data, property) => {
  if (!data || Object.keys(data).length === 0) return false;
  if (!property) return data;
  if (hasData(data, property)) return data[property];
  return false;
};

export const hasData = (data, property) => {
  if (data && data[property]) return true;
  return false;
};

export const commaSeparate = format(',');

export const sanitize = str => str.replace(/[^a-zA-Z0-9]/g, '');

export const traitAuthorYear = s =>
  `${s.traitReported} (${s.pubAuthor}, ${new Date(s.pubDate).getFullYear()})`;

export const isGreaterThanZero = arrayLength => {
  return arrayLength > 0;
};

export const getPhenotypeId = phenotypeId =>
  phenotypeId.includes('^')
    ? phenotypeId.slice(phenotypeId.lastIndexOf('^') + 1)
    : phenotypeId;

export const getSpliceId = phenotypeId =>
  phenotypeId.includes('^')
    ? phenotypeId.slice(0, phenotypeId.lastIndexOf('^'))
    : null;

// Consants
export const SIGNIFICANCE = -Math.log10(5e-8);
