import { useState } from 'react';
import { OVERVIEW, getDataAll, getDataAllDownload } from './utils';
import { getColumnsAll } from './Renderes';

export const useAssociatedGenes = (genesForVariantSchema, genesForVariant) => {
  const [value, setValue] = useState(OVERVIEW);

  const handleChange = (_, value) => {
    setValue(value);
  };

  const schemas = [
    ...genesForVariantSchema.distances.map((distanceSchema) => ({
      ...distanceSchema,
      type: 'distances',
    })),
    ...genesForVariantSchema.qtls.map((qtlSchema) => ({
      ...qtlSchema,
      type: 'qtls',
    })),
    ...genesForVariantSchema.intervals.map((intervalSchema) => ({
      ...intervalSchema,
      type: 'intervals',
    })),
    ...genesForVariantSchema.functionalPredictions.map((fpSchema) => ({
      ...fpSchema,
      type: 'functionalPredictions',
    })),
  ];

  const columnsAll = getColumnsAll(genesForVariantSchema, genesForVariant);
  const dataAll = getDataAll(genesForVariant);
  const dataAllDownload = getDataAllDownload(dataAll);

  return { value, schemas, columnsAll, dataAll, dataAllDownload, handleChange };
};
