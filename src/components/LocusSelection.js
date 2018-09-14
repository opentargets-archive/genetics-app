import React from 'react';
import { Chip, Text } from 'ot-ui';

// const AND = 'AND';
// const OR = 'OR';

const LocusSelection = ({
  selectedGenes,
  selectedTagVariants,
  selectedIndexVariants,
  selectedStudies,
  lookups,
  handleDeleteGene,
  handleDeleteTagVariant,
  handleDeleteIndexVariant,
  handleDeleteStudy,
}) => {
  const { geneDict, studyDict } = lookups;
  return (
    <div>
      <Text>
        {selectedGenes
          ? selectedGenes.map(d => (
              <Chip
                key={d}
                label={geneDict[d].symbol}
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
                label={studyDict[d].traitReported}
                type="study"
                onDelete={handleDeleteStudy(d)}
              />
            ))
          : null}
      </Text>
    </div>
  );
};

export default LocusSelection;
