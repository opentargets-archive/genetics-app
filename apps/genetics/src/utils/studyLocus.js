import { generateComparator, sanitize } from './common';
import gql from 'graphql-tag';


// keep and optimise
export function buildFilteredCredibleGwasColocalisation(
  gwasColocalisationResult,
  credibleSetSingleQueryResult,
  state
) {
  const filteredGwasColoc = gwasColocalisationResult
    .filter(d => d.log2h4h3 >= state.log2h4h3SliderValue)
    .filter(d => d.h4 >= state.h4SliderValue)
    .sort(log2h4h3Comparator)
    .reverse();

  return filteredGwasColoc.map(({ study, indexVariant, ...rest }) => ({
    key: `gwasCredibleSet__${study.studyId}__${indexVariant.id}`,
    study,
    indexVariant,
    credibleSet: buildCredibleSet(
      credibleSetSingleQueryResult,
      study,
      indexVariant,
      state.credSet95Value
    ),
    ...rest,
  }));
}

// keep and optimise
export function buildFilteredCredibleQtlColocalisation(
  qtlColocalisationResult,
  credibleSetSingleQueryResult,
  state
) {
  const filteredQtlColoc = qtlColocalisationResult
  .filter(d => d.log2h4h3 >= state.log2h4h3SliderValue)
  .filter(d => d.h4 >= state.h4SliderValue)
  .sort(log2h4h3Comparator)
  .reverse();

  return filteredQtlColoc.map(
    ({ qtlStudyName, gene, tissue, indexVariant, ...rest }) => {
      const key = `qtlCredibleSet__${qtlStudyName}__${gene.id}__${
        tissue.id
      }__${indexVariant.id}`;
      return {
        key,
        qtlStudyName,
        gene,
        tissue,
        indexVariant,
        credibleSet: credibleSetSingleQueryResult[key]
          ? credibleSetSingleQueryResult[key]
              .map(flattenPosition)
              .filter(d => (state.credSet95Value === '95' ? d.is95CredibleSet : true))
          : [],
        ...rest,
      };
    }
  );
}

export function filterPageCredibleSet(data, credSet95Value) {
  return data
    .map(flattenPosition)
    .filter(d => (credSet95Value === '95' ? d.is95CredibleSet : true));
}

export function filterCredibleSets(data, credibleSetIntersectionKeys) {
  return data.filter(d => credibleSetIntersectionKeys.indexOf(d.key) >= 0);
}

export function getCheckedCredibleSets(credibleSetsChecked) {
  return credibleSetsChecked.map(d =>
    d.credibleSet.map(({ tagVariant, ...rest }) => ({
      statsFields: rest,
      ...tagVariant,
    }))
  );
}

export function getVariantByCredibleSetsIntersection(variantsByCredibleSets) {
  let variantIdsInCredibleSetsIntersection = variantsByCredibleSets.reduce(
    (acc, vs, i) => {
      vs.forEach(v => {
        const { statsFields, ...variantFields } = v;
        if (acc[v.id]) {
          acc[v.id].posteriorProbabilityProd *=
            statsFields.posteriorProbability;
          acc[v.id].posteriorProbabilityMax = Math.max(
            acc[v.id].posteriorProbabilityMax,
            statsFields.posteriorProbability
          );
          acc[v.id].appearsInCount += 1;
        } else {
          acc[v.id] = {
            ...variantFields,
            posteriorProbabilityMax: statsFields.posteriorProbability,
            posteriorProbabilityProd: statsFields.posteriorProbability,
            appearsInCount: 1,
          };
        }
      });
      return acc;
    },
    {}
  );

  let variantsByCredibleSetsIntersection = Object.values(
    variantIdsInCredibleSetsIntersection
  )
    .filter(v => v.appearsInCount === variantsByCredibleSets.length)
    .map(v => ({
      ...v,
      posteriorProbability: v.posteriorProbabilityProd, // aliased for colouring on plot
    }));
  return variantsByCredibleSetsIntersection;
}

export function createCredibleSetsQuery({
  gwasColocalisation,
  qtlColocalisation,
}) {
  return gql(`query CredibleSetsQuery {
    ${gwasColocalisation.map(gwasCredibleSetQueryAliasedFragment).join('')}
    ${qtlColocalisation.map(qtlCredibleSetQueryAliasedFragment).join('')}
  }`);
}

const log2h4h3Comparator = generateComparator(d => d.log2h4h3);

const buildCredibleSet = (data, study, indexVariant, credSet95Value) => {
  const selection =
    data[`gwasCredibleSet__${study.studyId}__${indexVariant.id}`];
  if (selection === undefined) return [];
  return selection
    .map(flattenPosition)
    .filter(d => (credSet95Value === '95' ? d.is95CredibleSet : true));
};

const flattenPosition = ({ tagVariant, postProb, is95, is99, ...rest }) => {
  return {
    tagVariant,
    position: tagVariant.position,
    posteriorProbability: postProb,
    is95CredibleSet: is95,
    is99CredibleSet: is99,
    ...rest,
  };
};

const gwasCredibleSetQueryAliasedFragment = ({ study, indexVariant }) => `
gwasCredibleSet__${study.studyId}__${
  indexVariant.id
}: gwasCredibleSet(studyId: "${study.studyId}", variantId: "${
  indexVariant.id
}") {
  tagVariant {
    id
    rsId
    position
  }
  pval
  se
  beta
  postProb
  MultisignalMethod
  logABF
  is95
  is99
}
`;

const qtlCredibleSetQueryAliasedFragment = ({
  qtlStudyName,
  gene,
  tissue,
  indexVariant,
}) => {
  const tissueId = tissue.id.replaceAll('-', '_');
  const parseQTLStudyName = qtlStudyName.replaceAll('-', '_');
  const geneId = gene.id;
  const sanitizedTissueId = sanitize(tissueId);
  const sanitizedGeneId = sanitize(geneId);
  const sanitizedParseQTLStudyName = sanitize(parseQTLStudyName);
  return `
  qtlCredibleSet__${sanitizedParseQTLStudyName}__${sanitizedGeneId}__${sanitizedTissueId}__${
    indexVariant.id
  }: qtlCredibleSet(studyId: "${parseQTLStudyName}", variantId: "${
    indexVariant.id
  }", geneId: "${geneId}", bioFeature: "${tissueId}") {
    tagVariant {
      id
      rsId
      position
    }
    pval
    se
    beta
    postProb
    MultisignalMethod
    logABF
    is95
    is99
  }
  `;
};
