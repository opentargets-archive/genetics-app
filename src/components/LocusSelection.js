import React from 'react';
import { Chip, Text } from 'ot-ui';

// const AND = 'AND';
// const OR = 'OR';

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
    <Text>
      {selectedGenes
        ? selectedGenes.map(d => (
            <Chip
              key={d}
              label={d}
              type="gene"
              onDelete={handleDeleteGene(d)}
            />
          ))
        : null}
      {/* {selectedGenes &&
      (selectedTagVariants || selectedIndexVariants || selectedStudies)
        ? AND
        : null} */}
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
      {/* {selectedTagVariants && (selectedIndexVariants || selectedStudies)
        ? AND
        : null} */}
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
      {/* {selectedIndexVariants && selectedStudies ? AND : null} */}
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
    </Text>
  </div>
);

export default LocusSelection;
