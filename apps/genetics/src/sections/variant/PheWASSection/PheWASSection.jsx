import React, { useState } from 'react';
import { Query } from '@apollo/client/react/components';
import _ from 'lodash';
import { Typography, NativeSelect } from '@material-ui/core';

import {
  DownloadSVGPlot,
  ListTooltip,
  SectionHeading,
} from '../../../ot-ui-components';
import withTooltip from '../../../components/withTooltip';

import PheWAS from './PheWAS';
import PheWASTable, { tableColumns } from './PheWASTable';
import ForestPlot from './ForestPlot';

import PHEWAS_QUERY from '../../../queries/PheWASQuery.gql';
import GWAS_VARIANT_QUERY from './GWASLeadVariantsQuery.gql';
import TAG_VARIANT_QUERY from './TagVariantPageQuery.gql';
import { useQuery } from '@apollo/client';
import queryString from 'query-string';

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
      hasSumstats,
    } = study ?? {};
    return {
      studyId,
      hasSumstats,
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

function PheWASSection({ variantId, history }) {
  const _parseQueryProps = () => {
    const queryProps = queryString.parse(history.location.search);

    // single values need to be put in lists
    if (queryProps.phewasTraitFilter) {
      queryProps.phewasTraitFilter = Array.isArray(queryProps.phewasTraitFilter)
        ? queryProps.phewasTraitFilter
        : [queryProps.phewasTraitFilter];
    }
    if (queryProps.phewasCategoryFilter) {
      queryProps.phewasCategoryFilter = Array.isArray(
        queryProps.phewasCategoryFilter
      )
        ? queryProps.phewasCategoryFilter
        : [queryProps.phewasCategoryFilter];
    }
    return queryProps;
  };

  const handlePhewasTraitFilter = newPhewasTraitFilterValue => {
    const { phewasTraitFilter, ...rest } = _parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (newPhewasTraitFilterValue && newPhewasTraitFilterValue.length > 0) {
      newQueryParams.phewasTraitFilter = newPhewasTraitFilterValue.map(
        d => d.value
      );
    }
    _stringifyQueryProps(newQueryParams);
  };

  const handlePhewasCategoryFilter = newPhewasCategoryFilterValue => {
    const { phewasCategoryFilter, ...rest } = _parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (
      newPhewasCategoryFilterValue &&
      newPhewasCategoryFilterValue.length > 0
    ) {
      newQueryParams.phewasCategoryFilter = newPhewasCategoryFilterValue.map(
        d => d.value
      );
    }
    _stringifyQueryProps(newQueryParams);
  };

  const _stringifyQueryProps = newQueryParams => {
    history.replace({
      ...history.location,
      search: queryString.stringify(newQueryParams),
    });
  };

  const {
    phewasTraitFilter: phewasTraitFilterUrl,
    phewasCategoryFilter: phewasCategoryFilterUrl,
  } = _parseQueryProps();

  const [studySource, setStudySource] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState([]);
  let pheWASPlot = React.createRef();
  let forestPlot = React.createRef();

  const [chromosome, positionString] = variantId.split('_');
  const position = parseInt(positionString, 10);

  function handleSourceChange(e) {
    setStudySource(e.target.value);
  }

  function handleTraitSelection(newDropdownValue) {
    setSelectedCategories(_ => newDropdownValue.map(d => d.value));
  }

  const { loading: loading_gwas_variant, data: gwas_variant } = useQuery(
    GWAS_VARIANT_QUERY,
    {
      variables: { variantId },
    }
  );

  const { loading: loading_tag_variant, data: tag_variant } = useQuery(
    TAG_VARIANT_QUERY,
    {
      variables: { variantId },
    }
  );

  const isTagVariant =
    gwas_variant?.indexVariantsAndStudiesForTagVariant !== undefined;

  const isIndexVariant =
    tag_variant?.tagVariantsAndStudiesForIndexVariant !== undefined;

  return (
    <Query query={PHEWAS_QUERY} variables={{ variantId }}>
      {({ loading, error, data }) => {
        const isPheWASVariant = hasAssociations(data);
        const tooltipRows = tableColumns({
          variantId,
          chromosome,
          position,
          isIndexVariant,
          isTagVariant,
        });
        const PheWASWithTooltip = withTooltip(
          PheWAS,
          ListTooltip,
          tooltipRows,
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
              subheading="Which traits are associated with this variant in the UK Biobank, FinnGen, and/or GWAS Catalog summary statistics repository? Only traits with P-value < 0.005 are returned"
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
                <SectionHeading heading="Forest Plot"/>
                <Typography style={{ display: 'inline' }}>
                  Add a trait category to compare:
                </Typography>{' '}
                <ForestPlot
                  refs={forestPlot}
                  data={pheWASAssociationsFiltered}
                  variantId={variantId}
                  selectionHandler={handleTraitSelection}
                  selectedCategories={selectedCategories}
                  tooltipRows={tooltipRows}
                />
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
