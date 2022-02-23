import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from '@apollo/client/react/components';
import { loader } from 'graphql.macro';
import queryString from 'query-string';
import { useQuery } from '@apollo/client';

import { SectionHeading, Typography } from '../../ot-ui-components';
import { PlotContainer } from '../../ot-ui-components';

import BasePage from '../BasePage';
import AssociatedTagVariantsTable from '../../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../../components/AssociatedIndexVariantsTable';
import AssociatedGenes from '../../components/AssociatedGenes';
import ScrollToTop from '../../components/ScrollToTop';
import PheWASSection from '../../components/PheWASSection';

import NotFoundPage from '../NotFoundPage';
import Header from './Header';
import Summary from '../../sections/variant/Summary';

import {
  variantHasAssociatedTagVariants,
  variantHasAssociatedIndexVariants,
  variantHasAssociatedGenes,
  variantTransformAssociatedIndexVariants,
  variantTransformAssociatedTagVariants,
  variantParseGenesForVariantSchema,
} from '../../utils';

const VARIANT_PAGE_QUERY = loader('../../queries/VariantPageQuery.gql');
const VARIANT_HEADER_QUERY = loader('./VariantHeader.gql');

function VariantPage(props) {
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
  const _parseQueryProps = () => {
    const { history } = props;
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
  const _stringifyQueryProps = newQueryParams => {
    const { history } = props;
    history.replace({
      ...history.location,
      search: queryString.stringify(newQueryParams),
    });
  };
  const { match } = props;
  const { variantId } = match.params;
  const { loading, data: headerData } = useQuery(VARIANT_HEADER_QUERY, {
    variables: { variantId },
  });
  const {
    phewasTraitFilter: phewasTraitFilterUrl,
    phewasCategoryFilter: phewasCategoryFilterUrl,
  } = _parseQueryProps();

  if (headerData && !headerData.variantInfo) {
    return <NotFoundPage />;
  }
  return (
    <BasePage>
      <ScrollToTop />
      <Helmet>
        <title>{variantId}</title>
      </Helmet>
      <Header loading={loading} data={headerData} />
      <Summary variantId={variantId} />
      <Query query={VARIANT_PAGE_QUERY} variables={{ variantId }}>
        {({ loading, error, data }) => {
          const isGeneVariant = variantHasAssociatedGenes(data);
          const isTagVariant = variantHasAssociatedIndexVariants(data);
          const isIndexVariant = variantHasAssociatedTagVariants(data);

          const associatedIndexVariants = isTagVariant
            ? variantTransformAssociatedIndexVariants(data)
            : [];
          const associatedTagVariants = isIndexVariant
            ? variantTransformAssociatedTagVariants(data)
            : [];

          const genesForVariantSchema = isGeneVariant
            ? variantParseGenesForVariantSchema(data)
            : [];

          return (
            <Fragment>
              <SectionHeading
                heading="Assigned genes"
                subheading="Which genes are functionally implicated by this variant?"
                entities={[
                  {
                    type: 'variant',
                    fixed: true,
                  },
                  {
                    type: 'gene',
                    fixed: false,
                  },
                ]}
              />
              {isGeneVariant ? (
                <AssociatedGenes
                  variantId={variantId}
                  genesForVariantSchema={genesForVariantSchema}
                  genesForVariant={data.genesForVariant}
                />
              ) : (
                <PlotContainer
                  loading={loading}
                  error={error}
                  center={
                    <Typography variant="subtitle1">
                      {loading ? '...' : '(no data)'}
                    </Typography>
                  }
                />
              )}
              <PheWASSection
                variantId={variantId}
                phewasTraitFilterUrl={phewasTraitFilterUrl}
                phewasCategoryFilterUrl={phewasCategoryFilterUrl}
                handlePhewasTraitFilter={handlePhewasTraitFilter}
                handlePhewasCategoryFilter={handlePhewasCategoryFilter}
                isIndexVariant={isIndexVariant}
                isTagVariant={isTagVariant}
              />

              <SectionHeading
                heading="GWAS lead variants"
                subheading="Which GWAS lead variants are linked with this variant?"
                entities={[
                  {
                    type: 'study',
                    fixed: false,
                  },
                  {
                    type: 'indexVariant',
                    fixed: false,
                  },
                  {
                    type: 'tagVariant',
                    fixed: true,
                  },
                ]}
              />
              <AssociatedIndexVariantsTable
                loading={loading}
                error={error}
                data={associatedIndexVariants}
                variantId={variantId}
                filenameStem={`${variantId}-lead-variants`}
              />
              <SectionHeading
                heading="Tag variants"
                subheading="Which variants tag (through LD or fine-mapping) this lead variant?"
                entities={[
                  {
                    type: 'study',
                    fixed: false,
                  },
                  {
                    type: 'indexVariant',
                    fixed: true,
                  },
                  {
                    type: 'tagVariant',
                    fixed: false,
                  },
                ]}
              />
              <AssociatedTagVariantsTable
                loading={loading}
                error={error}
                data={associatedTagVariants}
                variantId={variantId}
                filenameStem={`${variantId}-tag-variants`}
              />
            </Fragment>
          );
        }}
      </Query>
    </BasePage>
  );
}

export default VariantPage;
