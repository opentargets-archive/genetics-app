import { format } from 'd3-format';

export const commaSeparate = format(',');

/* 
Example usage:
const comparatorDiseaseName = generateComparator(d => d.disease.name);
 */
export const generateComparator = accessor => (a, b) => {
  const aValue = accessor(a);
  const bValue = accessor(b);
  return aValue > bValue ? 1 : aValue === bValue ? 0 : -1;
};

// Consants
export const SIGNIFICANCE = -Math.log10(5e-8);

// chromosome helpers
export * from './chromosome';

// Pages helpers
export * from './gene';
export * from './variant';
export * from './study';
