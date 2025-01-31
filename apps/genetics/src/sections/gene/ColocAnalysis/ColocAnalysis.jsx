import React from 'react';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@material-ui/lab';
import _ from 'lodash';

import GENE_COLOC_ANALYSIS_QUERY from './ColocAnalysisQuery.gql';
import { SectionHeading } from '../../../ot-ui-components';
import ColocForGeneTable from '../../../components/ColocForGeneTable';
import { getData } from '../../../utils';

function ColocAnalysis({
  geneId,
  colocTraitFilterUrl,
  handleColocTraitFilter,
}) {
  const { loading, error, data } = useQuery(GENE_COLOC_ANALYSIS_QUERY, {
    variables: { geneId },
  });

  if (loading) {
    return <Skeleton height="20vh" width="80vw" />;
  }

  const geneData = getData(data, 'geneInfo');
  const colocalisationsForGene = getData(data, 'colocalisationsForGene');
  const { symbol } = geneData ? geneData : '';

  const colocalisationsForGeneFiltered = colocalisationsForGene.filter(
    geneRow =>
      colocTraitFilterUrl
        ? colocTraitFilterUrl.indexOf(geneRow.study.traitReported) >= 0
        : true
  );

  const colocTraitFilterOptions = _.uniq(
    colocalisationsForGeneFiltered.map(geneRow => geneRow.study.traitReported)
  ).map(geneRow => ({
    label: geneRow,
    value: geneRow,
    selected: colocTraitFilterUrl
      ? colocTraitFilterUrl.indexOf(geneRow) >= 0
      : false,
  }));

  const colocTraitFilterValue = _.sortBy(colocTraitFilterOptions, [
    geneRow => !geneRow.selected,
    'value',
  ]).filter(geneRow => geneRow.selected);

  return (
    <>
      <SectionHeading
        heading="Associated studies: Colocalisation analysis"
        subheading={`Which studies have evidence of colocalisation with molecular QTLs for ${symbol}?`}
      />
      <ColocForGeneTable
        loading={loading}
        error={error}
        data={colocalisationsForGeneFiltered}
        colocTraitFilterValue={colocTraitFilterValue}
        colocTraitFilterOptions={colocTraitFilterOptions}
        colocTraitFilterHandler={handleColocTraitFilter}
        filenameStem={`${geneId}-colocalising-studies`}
      />
    </>
  );
}

export default ColocAnalysis;