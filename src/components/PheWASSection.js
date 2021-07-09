import React, { useState } from 'react';
import { Query } from 'react-apollo';
import _ from 'lodash';
import { loader } from 'graphql.macro';
import { Typography, NativeSelect } from '@material-ui/core';

import { DownloadSVGPlot, ListTooltip, SectionHeading } from 'ot-ui';
import withTooltip from './withTooltip';
import PheWAS from './PheWAS';

import PheWASTable, { tableColumns } from '../components/PheWASTable';

const PHEWAS_QUERY = loader('../queries/PheWASQuery.gql');

function hasAssociations(data) {
  return (
    data &&
    data.pheWAS &&
    data.pheWAS.associations &&
    data.pheWAS.associations.length > 0
  );
}

function transformPheWAS(data) {
  return data.pheWAS.associations.map(d => {
    const { study, ...rest } = d;
    const {
      studyId,
      traitReported,
      traitCategory,
      pubDate,
      pubAuthor,
      pmid,
      source,
    } =
      study ?? {};
    return {
      studyId,
      source,
      traitReported,
      traitCategory,
      pubDate,
      pubAuthor,
      pmid,
      ...rest,
    };
  });
}

function isFromSource(study, studySource) {
  switch (studySource) {
    case 'finngen':
      return study.source === 'FINNGEN';
    case 'gwas':
      return study.source === 'GCST';
    case 'ukbiobank':
      return study.source === 'SAIGE' || study.source === 'NEALE';
    default:
      return true;
  }
}

function PheWASSection({
  variantId,
  phewasTraitFilterUrl,
  phewasCategoryFilterUrl,
  handlePhewasTraitFilter,
  handlePhewasCategoryFilter,
  isIndexVariant,
  isTagVariant,
}) {
  const [studySource, setStudySource] = useState('all');
  let pheWASPlot = React.createRef();

  const [chromosome, positionString] = variantId.split('_');
  const position = parseInt(positionString, 10);

  function handleSourceChange(e) {
    setStudySource(e.target.value);
  }

  return (
    <Query query={PHEWAS_QUERY} variables={{ variantId }}>
      {({ loading, error, data }) => {
        const isPheWASVariant = hasAssociations(data);
        const PheWASWithTooltip = withTooltip(
          PheWAS,
          ListTooltip,
          tableColumns({
            variantId,
            chromosome,
            position,
            isIndexVariant,
            isTagVariant,
          }),
          'phewas'
        );
        const pheWASAssociations = isPheWASVariant ? transformPheWAS(data) : [];
        // phewas - filtered
        const pheWASAssociationsFiltered = pheWASAssociations.filter(d => {
          return (
            (phewasTraitFilterUrl
              ? phewasTraitFilterUrl.indexOf(d.traitReported) >= 0
              : true) &&
            (phewasCategoryFilterUrl
              ? phewasCategoryFilterUrl.indexOf(d.traitCategory) >= 0
              : true) &&
            isFromSource(d, studySource)
          );
        });
        // phewas - filters
        const phewasTraitFilterOptions = _.sortBy(
          _.uniq(pheWASAssociationsFiltered.map(d => d.traitReported)).map(
            d => ({
              label: d,
              value: d,
              selected: phewasTraitFilterUrl
                ? phewasTraitFilterUrl.indexOf(d) >= 0
                : false,
            })
          ),
          [d => !d.selected, 'value']
        );
        const phewasTraitFilterValue = phewasTraitFilterOptions.filter(
          d => d.selected
        );
        const phewasCategoryFilterOptions = _.sortBy(
          _.uniq(pheWASAssociationsFiltered.map(d => d.traitCategory)).map(
            d => ({
              label: d,
              value: d,
              selected: phewasCategoryFilterUrl
                ? phewasCategoryFilterUrl.indexOf(d) >= 0
                : false,
            })
          ),
          [d => !d.selected, 'value']
        );
        const phewasCategoryFilterValue = phewasCategoryFilterOptions.filter(
          d => d.selected
        );

        return (
          <React.Fragment>
            <SectionHeading
              heading="PheWAS"
              subheading="Which traits are associated with this variant in the UK Biobank, FinnGen, and/or GWAS Catalog summary statistics repository? Only traits with P-value < 0.05 are returned."
              entities={[
                {
                  type: 'study',
                  fixed: false,
                },
                {
                  type: 'variant',
                  fixed: true,
                },
              ]}
            />
            {isPheWASVariant ? (
              <>
                <Typography style={{ display: 'inline' }}>
                  Show studies:
                </Typography>{' '}
                <NativeSelect onChange={handleSourceChange} value={studySource}>
                  <option value="all">
                    FinnGen, UK Biobank, and GWAS Catalog
                  </option>
                  <option value="finngen">FinnGen</option>
                  <option value="ukbiobank">UK Biobank</option>
                  <option value="gwas">GWAS Catalog</option>
                </NativeSelect>
                <DownloadSVGPlot
                  loading={loading}
                  error={error}
                  svgContainer={pheWASPlot}
                  filenameStem={`${variantId}-traits`}
                >
                  <PheWASWithTooltip
                    significancePVal={0.05 / data.pheWAS.totalGWASStudies}
                    associations={pheWASAssociationsFiltered}
                    ref={pheWASPlot}
                  />
                </DownloadSVGPlot>
              </>
            ) : null}
            <PheWASTable
              associations={pheWASAssociationsFiltered}
              {...{
                loading,
                error,
                variantId,
                chromosome,
                position,
                isIndexVariant,
                isTagVariant,
              }}
              traitFilterValue={phewasTraitFilterValue}
              traitFilterOptions={phewasTraitFilterOptions}
              traitFilterHandler={handlePhewasTraitFilter}
              categoryFilterValue={phewasCategoryFilterValue}
              categoryFilterOptions={phewasCategoryFilterOptions}
              categoryFilterHandler={handlePhewasCategoryFilter}
            />
          </React.Fragment>
        );
      }}
    </Query>
  );
}

export default PheWASSection;
