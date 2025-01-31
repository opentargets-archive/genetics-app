import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Skeleton } from '@material-ui/lab';
import { max } from 'd3';

import Slider from '../../../components/Slider';
import CredibleSetWithRegional from '../../../components/CredibleSetWithRegional';

import CredibleSetsGwasQtlList from '../CredibleSetsGwasQtlList';

import {
  traitAuthorYear,
  filterPageCredibleSet,
  createCredibleSetsQuery,
  isGreaterThanZero,
} from '../../../utils';

import CREDIBLE_SETS_GROUP_QUERY from './CredibleSetsGroupQuery.gql';
import GWAS_REGIONAL_QUERY from '../../../queries/GWASRegionalQuery.gql';

import {
  SectionHeading,
  PlotContainer,
  PlotContainerSection,
  significantFigures,
} from '../../../ot-ui-components';
import ErrorBoundary from '../../../components/ErrorBoundary';

const CredibleSetsGroup = ({ variantId, studyId, start, end, chromosome }) => {
  const PAGE_CREDIBLE_SET_KEY = `gwasCredibleSet__${studyId}__${variantId}`;

  let pageCredibleSet;
  let studyInfo;
  let pageCredibleSetAdjusted;
  let qtlColocalisation;
  let gwasColocalisation;

  let [credSet95Value, setCredSet95Value] = useState('all');
  let [log2h4h3SliderValue, setLog2h4h3SliderValue] = useState(1);
  let [h4SliderValue, setH4SliderValue] = useState(0.95);
  let [credibleSetIntersectionKeys, setCredibleSetIntersectionKeys] = useState(
    []
  );

  const handleCredSet95Change = event => {
    setCredSet95Value(event.target.value);
  };
  const handleLog2h4h3SliderChange = (_, value) => {
    setLog2h4h3SliderValue(value);
  };
  const handleH4SliderChange = (_, value) => {
    setH4SliderValue(value);
  };
  const handleCredibleSetIntersectionKeysCheckboxClick = key => event => {
    if (event.target.checked) {
      setCredibleSetIntersectionKeys([key, ...credibleSetIntersectionKeys]);
    } else {
      setCredibleSetIntersectionKeys(
        credibleSetIntersectionKeys.filter(d => d !== key)
      );
    }
  };

  useEffect(() => {
    setCredibleSetIntersectionKeys([
      `gwasCredibleSet__${studyId}__${variantId}`,
    ]);
  }, [studyId, variantId]);

  const {
    loading: credibleSetsGroupLoading,
    error: credibleSetsGroupError,
    data: credibleSetsGroupQueryResult,
  } = useQuery(CREDIBLE_SETS_GROUP_QUERY, {
    variables: { studyId, variantId },
  });

  if (credibleSetsGroupLoading) {
    return <Skeleton height="20vh" width="80vw" />;
  }

  ({ pageCredibleSet, studyInfo, gwasColocalisation, qtlColocalisation } =
    credibleSetsGroupQueryResult);

  pageCredibleSetAdjusted = filterPageCredibleSet(
    pageCredibleSet,
    credSet95Value
  );

  const maxLog2h4h3 = max([
    max(qtlColocalisation, d => d.log2h4h3),
    max(gwasColocalisation, d => d.log2h4h3),
  ]);

  const shouldMakeColocalisationCredibleSetQuery =
    isGreaterThanZero(gwasColocalisation.length) ||
    isGreaterThanZero(qtlColocalisation.length);

  const colocalisationCredibleSetQuery =
    shouldMakeColocalisationCredibleSetQuery
      ? createCredibleSetsQuery({ gwasColocalisation, qtlColocalisation })
      : null;

  return (
    <>
      <SectionHeading
        heading={`Credible Set Overlap`}
        subheading={`Which variants at this locus are most likely causal?`}
      />

      <PlotContainer
        center={
          <Typography>
            Showing credible sets for{' '}
            <strong>{traitAuthorYear(studyInfo)}</strong> and GWAS studies/QTLs
            in colocalisation. Expand the section to see the underlying regional
            plot.
          </Typography>
        }
      >
        <PlotContainerSection>
          <Grid container alignItems="center">
            <Grid item>
              <div style={{ padding: '0 20px' }}>
                <Typography>Credible set variants</Typography>
                <RadioGroup
                  style={{ padding: '0 16px' }}
                  row
                  aria-label="95% credible set"
                  name="credset95"
                  value={credSet95Value}
                  onChange={handleCredSet95Change}
                >
                  <FormControlLabel
                    value="95"
                    control={<Radio />}
                    label="95%"
                  />
                  <FormControlLabel
                    value="all"
                    control={<Radio />}
                    label="PP > 0.1%"
                  />
                </RadioGroup>
              </div>
            </Grid>
            <Grid item>
              <Slider
                label={`log2(H4/H3): ${significantFigures(
                  log2h4h3SliderValue
                )}`}
                min={0}
                max={Math.ceil(maxLog2h4h3)}
                step={Math.ceil(maxLog2h4h3) / 50}
                value={log2h4h3SliderValue}
                onChange={handleLog2h4h3SliderChange}
              />
            </Grid>
            <Grid item>
              <Slider
                label={`H4: ${significantFigures(h4SliderValue)}`}
                min={0}
                max={1}
                step={0.02}
                value={h4SliderValue}
                onChange={handleH4SliderChange}
              />
            </Grid>
          </Grid>
        </PlotContainerSection>
      </PlotContainer>

      <CredibleSetWithRegional
        checkboxProps={{
          checked:
            credibleSetIntersectionKeys.indexOf(PAGE_CREDIBLE_SET_KEY) >= 0,
          onChange: handleCredibleSetIntersectionKeysCheckboxClick(
            PAGE_CREDIBLE_SET_KEY
          ),
          value: PAGE_CREDIBLE_SET_KEY,
        }}
        credibleSetProps={{
          label: traitAuthorYear(studyInfo),
          start,
          end,
          data: pageCredibleSetAdjusted,
        }}
        regionalProps={{
          title: null,
          query: GWAS_REGIONAL_QUERY,
          variables: {
            studyId: studyInfo.studyId,
            chromosome,
            start,
            end,
          },
          start,
          end,
        }}
      />

      {shouldMakeColocalisationCredibleSetQuery &&
      colocalisationCredibleSetQuery ? (
        <ErrorBoundary>
          <CredibleSetsGwasQtlList
            query={colocalisationCredibleSetQuery}
            gwasColocalisation={gwasColocalisation}
            qtlColocalisation={qtlColocalisation}
            log2h4h3SliderValue={log2h4h3SliderValue}
            h4SliderValue={h4SliderValue}
            credSet95Value={credSet95Value}
            variantId={variantId}
            studyId={studyId}
            pageCredibleSetAdjusted={pageCredibleSetAdjusted}
            credibleSetIntersectionKeys={credibleSetIntersectionKeys}
            start={start}
            end={end}
            chromosome={chromosome}
            handleCredibleSetIntersectionKeysCheckboxClick={
              handleCredibleSetIntersectionKeysCheckboxClick
            }
          />
        </ErrorBoundary>
      ) : null}
    </>
  );
};

export default CredibleSetsGroup;
