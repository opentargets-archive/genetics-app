import React from 'react';
import { Chip } from 'ot-ui';

const LocusSelection = ({
  selectedGenes,
  selectedTagVariants,
  selectedIndexVariants,
  selectedStudies,
  handleDeleteGene,
  handleDeleteTagVariant,
  handleDeleteIndexVariant,
  handleDeleteStudy,
}) => (
  <div>
    {selectedGenes
      ? selectedGenes.map(d => (
          <Chip key={d} label={d} type="gene" onDelete={handleDeleteGene(d)} />
        ))
      : null}
    {selectedTagVariants
      ? selectedTagVariants.map(d => (
          <Chip
            key={d}
            label={d}
            type="tagVariant"
            onDelete={handleDeleteTagVariant(d)}
          />
        ))
      : null}
    {selectedIndexVariants
      ? selectedIndexVariants.map(d => (
          <Chip
            key={d}
            label={d}
            type="indexVariant"
            onDelete={handleDeleteIndexVariant(d)}
          />
        ))
      : null}
    {selectedStudies
      ? selectedStudies.map(d => (
          <Chip
            key={d}
            label={d}
            type="study"
            onDelete={handleDeleteStudy(d)}
          />
        ))
      : null}
  </div>
);

export default LocusSelection;
