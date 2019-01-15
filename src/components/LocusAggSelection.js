import React from 'react';
import { Chip, Typography } from 'ot-ui';

const LocusAggSelection = ({
  selectedGenes,
  selectedTagVariantBlocks,
  selectedIndexVariants,
  selectedStudies,
  lookups,
  handleDeleteGene,
  handleDeleteTagVariantBlock,
  handleDeleteIndexVariant,
  handleDeleteStudy,
}) => {
  const {
    geneDict,
    tagVariantBlockDict,
    indexVariantDict,
    studyDict,
  } = lookups;
  const noSelection =
    !selectedStudies &&
    !selectedIndexVariants &&
    !selectedTagVariantBlocks &&
    !selectedGenes;

  const geneIsInData = d => geneDict[d];
  const tagVariantBlockIsInData = d => tagVariantBlockDict[d];
  const indexVariantIsInData = d => indexVariantDict[d];
  const studyIsInData = d => studyDict[d];
  return (
    <div>
      {noSelection ? (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="subtitle1">No filters applied</Typography>
        </div>
      ) : null}
      {selectedStudies
        ? selectedStudies.map(d => (
            <Chip
              key={d}
              label={
                studyIsInData(d)
                  ? `${studyDict[d].traitReported}${
                      studyDict[d].pubAuthor && studyDict[d].pubDate
                        ? ` (${studyDict[d].pubAuthor} ${new Date(
                            studyDict[d].pubDate
                          ).getFullYear()})`
                        : null
                    }`
                  : `${d} (no data)`
              }
              type="study"
              onDelete={handleDeleteStudy(d)}
            />
          ))
        : null}
      {selectedIndexVariants
        ? selectedIndexVariants.map(d => (
            <Chip
              key={d}
              label={indexVariantIsInData(d) ? d : `${d} (no data)`}
              type="indexVariant"
              onDelete={handleDeleteIndexVariant(d)}
            />
          ))
        : null}
      {selectedTagVariantBlocks
        ? selectedTagVariantBlocks.map(d => (
            <Chip
              key={d}
              label={tagVariantBlockIsInData(d) ? d : `${d} (no data)`}
              type="tagVariant"
              onDelete={handleDeleteTagVariantBlock(d)}
            />
          ))
        : null}
      {selectedGenes
        ? selectedGenes.map(d => (
            <Chip
              key={d}
              label={geneIsInData(d) ? geneDict[d].symbol : `${d} (no data)`}
              type="gene"
              onDelete={handleDeleteGene(d)}
            />
          ))
        : null}
    </div>
  );
};

export default LocusAggSelection;
