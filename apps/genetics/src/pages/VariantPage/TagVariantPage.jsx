import React, { Fragment } from 'react';

import { useQuery } from '@apollo/client';
import { SectionHeading } from '../../ot-ui-components';
import AssociatedTagVariantsTable from '../../components/AssociatedTagVariantsTable';

import { variantTransformAssociatedTagVariants } from '../../utils';

import TAG_VARIANT_PAGE_QUERY from './TagVariantPageQuery.gql';

export const TagVariantPage = ({ variantId }) => {
  const { loading, error, data } = useQuery(TAG_VARIANT_PAGE_QUERY, {
    variables: { variantId },
  });

  const hasData =
    data?.tagVariantsAndStudiesForIndexVariant?.associations?.length > 0;
  const associatedTagVariants = hasData
    ? variantTransformAssociatedTagVariants(data)
    : [];

  return (
    <Fragment>
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
};
