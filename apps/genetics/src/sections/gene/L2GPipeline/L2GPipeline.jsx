import React from 'react';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@material-ui/lab';
import { Helmet } from 'react-helmet';
import { sortBy, uniq } from 'lodash';

import L2G_PIPELINE_QUERY from './L2GPipelineQuery.gql';

import { SectionHeading } from '../../../ot-ui-components';
import AssociatedStudiesTable from '../../../components/AssociatedStudiesTable';

// import { getData } from '../../../utils';

// TODO: remove after study locus PR merge
const getData = (data, property) => {
  if (!data || Object.keys(data).length === 0) return false;
  if (!property) return data;
  if (hasData(data, property)) return data[property];
  return false;
};

const hasData = (data, property) => {
  if (data && data[property]) return true;
  return false;
};

function L2GPipeline({
  geneId,
  traitFilterUrl,
  authorFilterUrl,
  handleTraitFilter,
  handleAuthorFilter,
}) {
  const { loading, error, data } = useQuery(L2G_PIPELINE_QUERY, {
    variables: { geneId },
  });

  if (loading) {
    return <Skeleton height="20vh" width="80vw" />;
  }

  const geneData = getData(data, 'geneInfo');
  const associatedStudies = getData(data, 'studiesAndLeadVariantsForGeneByL2G');
  const { chromosome, start, end, symbol } = geneData ? geneData : null;

  // filtered
  const associatedStudiesFiltered = associatedStudies.filter(d => {
    return (
      (traitFilterUrl
        ? traitFilterUrl.indexOf(d.study.traitReported) >= 0
        : true) &&
      (authorFilterUrl ? authorFilterUrl.indexOf(d.study.pubAuthor) >= 0 : true)
    );
  });

  const traitFilterOptions = sortBy(
    uniq(associatedStudiesFiltered.map(d => d.study.traitReported)).map(d => ({
      label: d,
      value: d,
      selected: traitFilterUrl ? traitFilterUrl.indexOf(d) >= 0 : false,
    })),
    [d => !d.selected, 'value']
  );
  const traitFilterValue = traitFilterOptions.filter(d => d.selected);
  const authorFilterOptions = sortBy(
    uniq(associatedStudiesFiltered.map(d => d.study.pubAuthor)).map(d => ({
      label: d,
      value: d,
      selected: authorFilterUrl ? authorFilterUrl.indexOf(d) >= 0 : false,
    })),
    [d => !d.selected, 'value']
  );
  const authorFilterValue = authorFilterOptions.filter(d => d.selected);

  return (
    <>
      <Helmet>
        <title>{symbol}</title>
      </Helmet>
      <SectionHeading
        heading="Associated studies: locus-to-gene pipeline"
        subheading={`Which studies are associated with ${symbol}?`}
        entities={[
          {
            type: 'study',
            fixed: false,
          },
          {
            type: 'gene',
            fixed: true,
          },
        ]}
      />
      <AssociatedStudiesTable
        loading={loading}
        error={error}
        data={associatedStudiesFiltered}
        geneId={geneId}
        geneSymbol={symbol}
        chromosome={chromosome}
        position={Math.round((start + end) / 2)}
        traitFilterValue={traitFilterValue}
        traitFilterOptions={traitFilterOptions}
        traitFilterHandler={handleTraitFilter}
        authorFilterValue={authorFilterValue}
        authorFilterOptions={authorFilterOptions}
        authorFilterHandler={handleAuthorFilter}
        filenameStem={`${geneId}-associated-studies`}
      />
    </>
  );
}

export default L2GPipeline;
