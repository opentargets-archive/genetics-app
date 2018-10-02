import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import {
  PageTitle,
  SubHeading,
  DownloadSVGPlot,
  SectionHeading,
  ListTooltip,
  Typography,
} from 'ot-ui';
import { PheWAS, withTooltip } from 'ot-charts';

import BasePage from './BasePage';
import PheWASTable, { tableColumns } from '../components/PheWASTable';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';
import AssociatedGenes from '../components/AssociatedGenes';
import ScrollToTop from '../components/ScrollToTop';
import LocusLink from '../components/LocusLink';
import transformGenesForVariantsSchema from '../logic/transformGenesForVariantSchema';
import PlotContainer from 'ot-ui/build/components/PlotContainer';
import StudyInfo from '../components/StudyInfo';

function hasInfo(data) {
  return data && data.variantInfo;
}
function hasAssociatedGenes(data) {
  return data && data.genesForVariantSchema;
}
function hasAssociations(data) {
  return (
    data &&
    data.pheWAS &&
    data.pheWAS.associations &&
    data.pheWAS.associations.length > 0
  );
}
function hasAssociatedIndexVariants(data) {
  return (
    data &&
    data.indexVariantsAndStudiesForTagVariant &&
    data.indexVariantsAndStudiesForTagVariant.associations &&
    data.indexVariantsAndStudiesForTagVariant.associations.length > 0
  );
}
function hasAssociatedTagVariants(data) {
  return (
    data &&
    data.tagVariantsAndStudiesForIndexVariant &&
    data.tagVariantsAndStudiesForIndexVariant.associations &&
    data.tagVariantsAndStudiesForIndexVariant.associations.length > 0
  );
}

function transformVariantInfo(data) {
  return data.variantInfo;
}
function transformPheWAS(data) {
  return data.pheWAS.associations.map(d => {
    const { study, ...rest } = d;
    const { studyId, traitReported, traitCategory } = study;
    return {
      studyId,
      traitReported,
      traitCategory,
      ...rest,
    };
  });
}
function transformAssociatedIndexVariants(data) {
  const associationsFlattened = data.indexVariantsAndStudiesForTagVariant.associations.map(
    d => {
      const { indexVariant, study, ...rest } = d;
      return {
        indexVariantId: indexVariant.id,
        indexVariantRsId: indexVariant.rsId,
        studyId: study.studyId,
        traitReported: study.traitReported,
        pmid: study.pmid,
        pubDate: study.pubDate,
        pubAuthor: study.pubAuthor,
        ...rest,
      };
    }
  );
  return associationsFlattened;
}
function transformAssociatedTagVariants(data) {
  const associationsFlattened = data.tagVariantsAndStudiesForIndexVariant.associations.map(
    d => {
      const { tagVariant, study, ...rest } = d;
      return {
        tagVariantId: tagVariant.id,
        tagVariantRsId: tagVariant.rsId,
        studyId: study.studyId,
        traitReported: study.traitReported,
        pmid: study.pmid,
        pubDate: study.pubDate,
        pubAuthor: study.pubAuthor,
        ...rest,
      };
    }
  );
  return associationsFlattened;
}

const variantPageQuery = gql`
  query VariantPageQuery($variantId: String!) {
    variantInfo(variantId: $variantId) {
      rsId
      nearestGene {
        id
        symbol
      }
      nearestCodingGene {
        id
        symbol
      }
    }
    genesForVariantSchema {
      qtls {
        id
        sourceId
        tissues {
          id
          name
        }
      }
      intervals {
        id
        sourceId
        tissues {
          id
          name
        }
      }
      functionalPredictions {
        id
        sourceId
        tissues {
          id
          name
        }
      }
    }
    genesForVariant(variantId: $variantId) {
      gene {
        id
        symbol
      }
      overallScore
      qtls {
        sourceId
        aggregatedScore
        tissues {
          tissue {
            id
            name
          }
          quantile
          beta
          pval
        }
      }
      intervals {
        sourceId
        aggregatedScore
        tissues {
          tissue {
            id
            name
          }
          quantile
          score
        }
      }
      functionalPredictions {
        sourceId
        aggregatedScore
        tissues {
          tissue {
            id
            name
          }
          maxEffectLabel
          maxEffectScore
        }
      }
    }
    pheWAS(variantId: $variantId) {
      associations {
        study {
          studyId
          traitReported
          traitCode
          traitCategory
        }
        pval
        beta
        oddsRatio
        nTotal
        nCases
      }
    }
    indexVariantsAndStudiesForTagVariant(variantId: $variantId) {
      associations {
        indexVariant {
          id
          rsId
        }
        study {
          studyId
          traitReported
          pmid
          pubDate
          pubAuthor
        }
        pval
        nTotal
        overallR2
        posteriorProbability
      }
    }
    tagVariantsAndStudiesForIndexVariant(variantId: $variantId) {
      associations {
        tagVariant {
          id
          rsId
        }
        study {
          studyId
          traitReported
          pmid
          pubDate
          pubAuthor
        }
        pval
        nTotal
        overallR2
        posteriorProbability
      }
    }
  }
`;

const VariantPage = ({ match }) => {
  let pheWASPlot = React.createRef();
  const { variantId } = match.params;
  const [chromosome, positionString] = variantId.split('_');
  const position = parseInt(positionString, 10);
  return (
    <BasePage>
      <ScrollToTop onRouteChange />
      <Helmet>
        <title>{variantId}</title>
      </Helmet>
      <Query query={variantPageQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          const isVariantWithInfo = hasInfo(data);
          const isGeneVariant = hasAssociatedGenes(data);
          const isPheWASVariant = hasAssociations(data);
          const isTagVariant = hasAssociatedIndexVariants(data);
          const isIndexVariant = hasAssociatedTagVariants(data);

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

          const variantInfo = isVariantWithInfo
            ? transformVariantInfo(data)
            : {};
          const pheWASAssociations = isPheWASVariant
            ? transformPheWAS(data)
            : [];
          const associatedIndexVariants = isTagVariant
            ? transformAssociatedIndexVariants(data)
            : [];
          const associatedTagVariants = isIndexVariant
            ? transformAssociatedTagVariants(data)
            : [];
          return (
            <React.Fragment>
              <PageTitle>
                {variantId}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {variantInfo.rsId}
                </span>
              </PageTitle>
              <SubHeading
                left={
                  isIndexVariant ? (
                    <LocusLink
                      chromosome={chromosome}
                      position={position}
                      selectedIndexVariants={[variantId]}
                    >
                      View locus
                    </LocusLink>
                  ) : isTagVariant ? (
                    <LocusLink
                      chromosome={chromosome}
                      position={position}
                      selectedTagVariants={[variantId]}
                    >
                      View locus
                    </LocusLink>
                  ) : null
                }
                right={
                  <div>
                    {variantInfo.nearestGene ? (
                      <React.Fragment>
                        Nearest Gene:{' '}
                        <Link to={`/gene/${variantInfo.nearestGene.id}`}>
                          {variantInfo.nearestGene.symbol}
                        </Link>
                      </React.Fragment>
                    ) : null}
                    {variantInfo.nearestGene && variantInfo.nearestCodingGene
                      ? ', '
                      : null}
                    {variantInfo.nearestCodingGene ? (
                      <React.Fragment>
                        Nearest Protein-Coding Gene:{' '}
                        <Link to={`/gene/${variantInfo.nearestCodingGene.id}`}>
                          {variantInfo.nearestCodingGene.symbol}
                        </Link>
                      </React.Fragment>
                    ) : null}
                  </div>
                }
              />
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
                  genesForVariantSchema={transformGenesForVariantsSchema(
                    data.genesForVariantSchema
                  )}
                  genesForVariant={data.genesForVariant}
                />
              ) : (
                <PlotContainer
                  loading={loading}
                  error={error}
                  center={
                    <Typography variant="subheading">
                      {loading ? '...' : '(no data)'}
                    </Typography>
                  }
                />
              )}
              <SectionHeading
                heading="PheWAS"
                subheading="Which traits are associated with this variant in UK Biobank?"
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
                <DownloadSVGPlot
                  loading={loading}
                  error={error}
                  svgContainer={pheWASPlot}
                  filenameStem={`${variantId}-traits`}
                >
                  <PheWASWithTooltip
                    associations={pheWASAssociations}
                    ref={pheWASPlot}
                  />
                </DownloadSVGPlot>
              ) : null}
              <PheWASTable
                associations={pheWASAssociations}
                {...{
                  loading,
                  error,
                  variantId,
                  chromosome,
                  position,
                  isIndexVariant,
                  isTagVariant,
                }}
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
                subheading="Which variants tag (through LD or finemapping) this lead variant?"
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
            </React.Fragment>
          );
        }}
      </Query>
    </BasePage>
  );
};

export default VariantPage;
