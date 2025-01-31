import React from 'react';
import { useQuery } from '@apollo/client';

import Typography from '@material-ui/core/Typography';
import { Skeleton } from '@material-ui/lab';

import {
  buildFilteredCredibleGwasColocalisation,
  buildFilteredCredibleQtlColocalisation,
  filterCredibleSets,
  getCheckedCredibleSets,
  getVariantByCredibleSetsIntersection,
  traitAuthorYear,
} from '../../../utils';

import { PlotContainer, PlotContainerSection } from '../../../ot-ui-components';

import CredibleSet from '../../../components/CredibleSet';
import CredibleSetWithRegional from '../../../components/CredibleSetWithRegional';
import CredibleSetsIntersectionTable from '../../../components/CredibleSetsIntersectionTable';

import GWAS_REGIONAL_QUERY from '../../../queries/GWASRegionalQuery.gql';
import QTL_REGIONAL_QUERY from '../../../queries/QTLRegionalQuery.gql';

export default function CredibleSetsGwasQtlList({
  chromosome,
  credSet95Value,
  credibleSetIntersectionKeys,
  end,
  gwasColocalisation,
  h4SliderValue,
  handleCredibleSetIntersectionKeysCheckboxClick,
  log2h4h3SliderValue,
  pageCredibleSetAdjusted,
  qtlColocalisation,
  query,
  start,
  studyId,
  variantId,
}) {
  const PAGE_CREDIBLE_SET_KEY = `gwasCredibleSet__${studyId}__${variantId}`;

  const {
    loading: credibleSetSingleLoading,
    error: credibleSetSingleError,
    data: credibleSetSingleQueryResult,
  } = useQuery(query);

  if (credibleSetSingleLoading) {
    return <Skeleton height="20vh" width="80vw" />;
  }

  const gwasColocalisationCredibleSetsFiltered = buildFilteredCredibleGwasColocalisation(
    gwasColocalisation,
    credibleSetSingleQueryResult,
    { log2h4h3SliderValue, h4SliderValue, credSet95Value }
  );

  const qtlColocalisationCredibleSetsFiltered = buildFilteredCredibleQtlColocalisation(
    qtlColocalisation,
    credibleSetSingleQueryResult,
    { log2h4h3SliderValue, h4SliderValue, credSet95Value }
  );

  const credibleSetsAll = [
    {
      key: PAGE_CREDIBLE_SET_KEY,
      credibleSet: pageCredibleSetAdjusted,
    },
    ...gwasColocalisationCredibleSetsFiltered.map(({ key, credibleSet }) => ({
      key,
      credibleSet,
    })),
    ...qtlColocalisationCredibleSetsFiltered.map(({ key, credibleSet }) => ({
      key,
      credibleSet,
    })),
  ];

  // TODO: club into one function
  const credibleSetsChecked = filterCredibleSets(
    credibleSetsAll,
    credibleSetIntersectionKeys
  );
  const variantsByCredibleSets = getCheckedCredibleSets(credibleSetsChecked);
  const variantsByCredibleSetsIntersection = getVariantByCredibleSetsIntersection(
    variantsByCredibleSets
  );

  return (
    <>
      <Typography style={{ paddingTop: '10px' }}>
        <strong>GWAS</strong>
      </Typography>
      {gwasColocalisationCredibleSetsFiltered.length > 0 ? (
        gwasColocalisationCredibleSetsFiltered.map(d => {
          return (
            <CredibleSetWithRegional
              key={d.key}
              checkboxProps={{
                checked: credibleSetIntersectionKeys.indexOf(d.key) >= 0,
                onChange: handleCredibleSetIntersectionKeysCheckboxClick(d.key),
                value: d.key,
              }}
              credibleSetProps={{
                label: traitAuthorYear(d.study),
                start,
                end,
                h4: d.h4,
                logH4H3: d.log2h4h3,
                data: d.credibleSet,
              }}
              regionalProps={{
                title: null,
                query: GWAS_REGIONAL_QUERY,
                variables: {
                  studyId: d.study.studyId,
                  chromosome,
                  start,
                  end,
                },
                start,
                end,
              }}
            />
          );
        })
      ) : (
        <Typography align="center">
          No GWAS studies satisfying the applied filters.
        </Typography>
      )}

      <Typography style={{ paddingTop: '10px' }}>
        <strong>QTL</strong>
      </Typography>
      {qtlColocalisationCredibleSetsFiltered.length > 0 ? (
        qtlColocalisationCredibleSetsFiltered.map(d => {
          return (
            <CredibleSetWithRegional
              key={d.key}
              checkboxProps={{
                checked: credibleSetIntersectionKeys.indexOf(d.key) >= 0,
                onChange: handleCredibleSetIntersectionKeysCheckboxClick(d.key),
                value: d.key,
              }}
              credibleSetProps={{
                label: `${d.qtlStudyName}: ${d.gene.symbol} in ${
                  d.tissue.name
                }`,
                start,
                end,
                h4: d.h4,
                logH4H3: d.log2h4h3,
                data: d.credibleSet,
              }}
              regionalProps={{
                title: null,
                query: QTL_REGIONAL_QUERY,
                variables: {
                  studyId: d.qtlStudyName,
                  geneId: d.gene.id,
                  bioFeature: d.tissue.id,
                  chromosome,
                  start,
                  end,
                },
                start,
                end,
              }}
            />
          );
        })
      ) : (
        <Typography align="center">
          No QTL studies satisfying the applied filters.
        </Typography>
      )}

      <Typography style={{ paddingTop: '10px' }}>
        <strong>Intersection of credible set variants</strong>
      </Typography>
      <PlotContainer>
        <PlotContainerSection>
          <div style={{ paddingRight: '32px' }}>
            <CredibleSet
              label="Intersection Variants"
              start={start}
              end={end}
              data={variantsByCredibleSetsIntersection}
            />
          </div>
        </PlotContainerSection>
      </PlotContainer>
      <CredibleSetsIntersectionTable
        data={variantsByCredibleSetsIntersection}
        filenameStem={`${studyId}-${variantId}-credset-intersection`}
      />
    </>
  );
}
