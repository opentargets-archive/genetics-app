import React, { Fragment } from 'react';
import { useQuery } from '@apollo/client';

import { SectionHeading } from '../../ot-ui-components';
import AssociatedIndexVariantsTable from '../../components/AssociatedIndexVariantsTable';

import { variantTransformAssociatedIndexVariants } from '../../utils';

import GWAS_LEAD_VARIANTS_QUERY from './GWASLeadVariantsQuery.gql';

export const GWASLeadVariants = ({ variantId }) => {
  const { loading, error, data } = useQuery(GWAS_LEAD_VARIANTS_QUERY, {
    variables: { variantId },
  });

  const hasData =
    data?.indexVariantsAndStudiesForTagVariant?.associations?.length > 0;
  const associatedIndexVariants = hasData
    ? variantTransformAssociatedIndexVariants(data)
    : [];

  return (
    <Fragment>
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
    </Fragment>
  );
};
