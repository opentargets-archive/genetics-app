import React from 'react';

import { useQuery } from '@apollo/client';

import Typography from '@material-ui/core/Typography';
import { Skeleton } from '@material-ui/lab';
import GeneTrack from '../../../components/GeneTrack';
import { PlotContainer, PlotContainerSection } from '../../../ot-ui-components';

import STUDY_LOCUS_GENES from './StudyLocusGenesQuery.gql';


const flatExonsToPairedExons = genes => {
  const paired = genes.map(d => ({
    ...d,
    exons: d.exons.reduce((result, value, index, array) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }
      return result;
    }, []),
  }));
  return paired;
};

const StudyLocusGenes = ({ chromosome, start, end }) => {
  const { loading, error, data: queryResult } = useQuery(STUDY_LOCUS_GENES, {
    variables: { chromosome, start, end },
  });

  return (
    <>
      <Typography style={{ paddingTop: '10px' }}>
        <strong>Genes</strong>
      </Typography>
      <PlotContainer>
        <PlotContainerSection>
          <div style={{ paddingRight: '32px' }}>
            {loading ? (
              <Skeleton width="85vw" height="20vh" />
            ) : (
              <GeneTrack
                data={{ genes: flatExonsToPairedExons(queryResult.genes) }}
                start={start}
                end={end}
              />
            )}
          </div>
        </PlotContainerSection>
      </PlotContainer>
    </>
  );
};

export default StudyLocusGenes;
