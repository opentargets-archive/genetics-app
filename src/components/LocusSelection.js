import React from 'react';
import { Typography } from '../ot-ui-components';

import Chip from './LocusChip';

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
  const { geneDict, tagVariantDict, indexVariantDict, studyDict } = lookups;
  const noSelection =
    !selectedStudies &&
    !selectedIndexVariants &&
    !selectedTagVariants &&
    !selectedGenes;

  const geneIsInData = d => geneDict[d];
  const tagVariantIsInData = d => tagVariantDict[d];
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
      {selectedTagVariants
        ? selectedTagVariants.map(d => (
            <Chip
              key={d}
              label={tagVariantIsInData(d) ? d : `${d} (no data)`}
              type="tagVariant"
              onDelete={handleDeleteTagVariant(d)}
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

export default LocusSelection;
