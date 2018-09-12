import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, DownloadSVGPlot, SectionHeading } from 'ot-ui';
import { PheWAS } from 'ot-charts';

import BasePage from './BasePage';
import PheWASTable, { tableColumns } from '../components/PheWASTable';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';
import AssociatedGenes from '../components/AssociatedGenes';
import ScrollToTop from '../components/ScrollToTop';
import withTooltip from '../components/withTooltip';

const PheWASWithTooltip = withTooltip(PheWAS, tableColumns);

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

const associatedGenesQuery = gql`
  query GenesForVariantQuery($variantId: String!) {
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
  }
`;

const pheWASQuery = gql`
  query PheWASQuery($variantId: String!) {
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
  }
`;

const associatedIndexesQuery = gql`
  query AssociatedIndexVariantsQuery($variantId: String!) {
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
  }
`;

const associatedTagsQuery = gql`
  query AssociatedTagVariantsQuery($variantId: String!) {
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

  return (
    <BasePage>
      <ScrollToTop onRouteChange />
      <Helmet>
        <title>{variantId}</title>
      </Helmet>
      <PageTitle>{`Variant ${variantId}`}</PageTitle>
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
      <Query query={associatedGenesQuery} variables={{ variantId }}>
        {({ data }) => {
          return data.genesForVariantSchema ? (
            <AssociatedGenes data={data} />
          ) : null;
        }}
      </Query>

      <Query query={pheWASQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          return hasAssociations(data) ? (
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
              <PheWASTable associations={data.pheWAS.associations} />
            </Fragment>
          ) : null;
        }}
      </Query>

      <Query query={associatedIndexesQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          return hasAssociatedIndexVariants(data) ? (
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
          ) : null;
        }}
      </Query>

      <Query query={associatedTagsQuery} variables={{ variantId }}>
        {({ loading, error, data }) => {
          return hasAssociatedTagVariants(data) ? (
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
          ) : null;
        }}
      </Query>
    </BasePage>
  );
};

export default VariantPage;
