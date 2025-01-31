import React, { Fragment } from 'react';

import { useQuery } from '@apollo/client';

import { SectionHeading, Typography } from '../../ot-ui-components';
import { PlotContainer } from '../../ot-ui-components';

import AssociatedGenes from '../../sections/variant/AssociatedGenes';

import { variantParseGenesForVariantSchema } from '../../utils';

import GENES_VARIANT_QUERY from './GenesForVariantQuery.gql';

export const AssignedGenes = ({ variantId }) => {
  const { loading, error, data } = useQuery(GENES_VARIANT_QUERY, {
    variables: { variantId },
  });

  const genesForVariantSchema = data?.genesForVariantSchema
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
      {data?.genesForVariantSchema ? (
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
    </Fragment>
  );
};
