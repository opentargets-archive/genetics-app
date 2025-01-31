import React, { Fragment } from 'react';
import { GenesTabs, TabOverview, TabIssues, useAssociatedGenes } from '.';

const AssociatedGenes = ({
  variantId,
  genesForVariantSchema,
  genesForVariant,
}) => {
  const { value, schemas, columnsAll, dataAll, dataAllDownload, handleChange } =
    useAssociatedGenes(genesForVariantSchema, genesForVariant);

  return (
    <Fragment>
      <GenesTabs
        schemas={schemas}
        value={value}
        dataAll={dataAll}
        handleChange={handleChange}
      />
      <TabOverview
        value={value}
        columnsAll={columnsAll}
        dataAllDownload={dataAllDownload}
        variantId={variantId}
        dataAll={dataAll}
      />
      <TabIssues
        schemas={schemas}
        value={value}
        variantId={variantId}
        genesForVariantSchema={genesForVariantSchema}
        genesForVariant={genesForVariant}
      />
    </Fragment>
  );
};

export default AssociatedGenes;
