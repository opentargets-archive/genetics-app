import React from 'react';
import { Chip, Text } from 'ot-ui';

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
        {selectedStudies
          ? selectedStudies.map(d => (
              <Chip
                key={d}
                label={`${studyDict[d].traitReported}${
                  studyDict[d].pubAuthor && studyDict[d].pubDate
                    ? ` (${studyDict[d].pubAuthor} ${new Date(
                        studyDict[d].pubDate
                      ).getFullYear()})`
                    : null
                }`}
                type="study"
                onDelete={handleDeleteStudy(d)}
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
      </Text>
    </div>
  );
};

export default LocusSelection;
