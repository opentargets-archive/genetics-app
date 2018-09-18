import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, SubHeading, DownloadSVGPlot, SectionHeading } from 'ot-ui';
import { PheWAS } from 'ot-charts';

import BasePage from './BasePage';
import PheWASTable, { tableColumns } from '../components/PheWASTable';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';
import AssociatedGenes from '../components/AssociatedGenes';
import ScrollToTop from '../components/ScrollToTop';
import withTooltip from '../components/withTooltip';
import LocusLink from '../components/LocusLink';

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
    data.indexVariantsAndStudiesForTagVariant &&
    data.indexVariantsAndStudiesForTagVariant.associations &&
    data.indexVariantsAndStudiesForTagVariant.associations.length > 0
  );
}

function transformAssociatedIndexVariants(data) {
  const associationsFlattened = data.associations.map(d => {
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
  });
  return {
    associations: associationsFlattened,
  };
}

function hasAssociatedTagVariants(data) {
  return (
    data.tagVariantsAndStudiesForIndexVariant &&
    data.tagVariantsAndStudiesForIndexVariant.associations &&
    data.tagVariantsAndStudiesForIndexVariant.associations.length > 0
  );
}

function transformAssociatedTagVariants(data) {
  const associationsFlattened = data.associations.map(d => {
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
  });
  return {
    associations: associationsFlattened,
  };
}

const variantPageQuery = gql`
  query VariantPageQuery($variantId: String!) {
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
        id
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
        id
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
        id
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
        studyId
        traitReported
        traitCode
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
      <PageTitle>{`Variant ${variantId}`}</PageTitle>

      <Query query={variantPageQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          const isGeneVariant = hasAssociatedGenes(data);
          const isTagVariant = hasAssociatedIndexVariants(data);
          const isIndexVariant = hasAssociatedTagVariants(data);
          const PheWASWithTooltip = withTooltip(
            PheWAS,
            tableColumns({
              variantId,
              chromosome,
              position,
              isIndexVariant,
              isTagVariant,
            })
          );
          return (
            <React.Fragment>
              <SubHeading>
                {isIndexVariant ? (
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
                ) : null}
              </SubHeading>
              {isGeneVariant ? (
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
                  <AssociatedGenes data={data} />
                </Fragment>
              ) : null}
              {hasAssociations(data) ? (
                <Fragment>
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
                  <DownloadSVGPlot
                    svgContainer={pheWASPlot}
                    filenameStem={`${variantId}-traits`}
                  >
                    <PheWASWithTooltip
                      associations={data.pheWAS.associations}
                      ref={pheWASPlot}
                    />
                  </DownloadSVGPlot>
                  <PheWASTable
                    associations={data.pheWAS.associations}
                    {...{
                      variantId,
                      chromosome,
                      position,
                      isIndexVariant,
                      isTagVariant,
                    }}
                  />
                </Fragment>
              ) : null}
              {isTagVariant ? (
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
                    data={
                      transformAssociatedIndexVariants(
                        data.indexVariantsAndStudiesForTagVariant
                      ).associations
                    }
                    variantId={variantId}
                    filenameStem={`${variantId}-lead-variants`}
                  />
                </Fragment>
              ) : null}
              {isIndexVariant ? (
                <Fragment>
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
                    data={
                      transformAssociatedTagVariants(
                        data.tagVariantsAndStudiesForIndexVariant
                      ).associations
                    }
                    variantId={variantId}
                    filenameStem={`${variantId}-tag-variants`}
                  />
                </Fragment>
              ) : null}
            </React.Fragment>
          );
        }}
      </Query>
    </BasePage>
  );
};

export default VariantPage;
