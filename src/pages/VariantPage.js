import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';

import { PageTitle, SubHeading, SectionHeading, Typography } from 'ot-ui';

import BasePage from './BasePage';
import AssociatedTagVariantsTable from '../components/AssociatedTagVariantsTable';
import AssociatedIndexVariantsTable from '../components/AssociatedIndexVariantsTable';
import AssociatedGenes from '../components/AssociatedGenes';
import ScrollToTop from '../components/ScrollToTop';
import LocusLink from '../components/LocusLink';
import transformGenesForVariantsSchema from '../logic/transformGenesForVariantSchema';
import PlotContainer from 'ot-ui/build/components/PlotContainer';
import PheWASSection from '../components/PheWASSection';

function hasInfo(data) {
  return data && data.variantInfo;
}
function hasAssociatedGenes(data) {
  return data && data.genesForVariantSchema;
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

class VariantPage extends React.Component {
  handlePhewasTraitFilter = newPhewasTraitFilterValue => {
    const { phewasTraitFilter, ...rest } = this._parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (newPhewasTraitFilterValue && newPhewasTraitFilterValue.length > 0) {
      newQueryParams.phewasTraitFilter = newPhewasTraitFilterValue.map(
        d => d.value
      );
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handlePhewasCategoryFilter = newPhewasCategoryFilterValue => {
    const { phewasCategoryFilter, ...rest } = this._parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (
      newPhewasCategoryFilterValue &&
      newPhewasCategoryFilterValue.length > 0
    ) {
      newQueryParams.phewasCategoryFilter = newPhewasCategoryFilterValue.map(
        d => d.value
      );
    }
    this._stringifyQueryProps(newQueryParams);
  };
  _parseQueryProps() {
    const { history } = this.props;
    const queryProps = queryString.parse(history.location.search);

    // single values need to be put in lists
    if (queryProps.phewasTraitFilter) {
      queryProps.phewasTraitFilter = Array.isArray(queryProps.phewasTraitFilter)
        ? queryProps.phewasTraitFilter
        : [queryProps.phewasTraitFilter];
    }
    if (queryProps.phewasCategoryFilter) {
      queryProps.phewasCategoryFilter = Array.isArray(
        queryProps.phewasCategoryFilter
      )
        ? queryProps.phewasCategoryFilter
        : [queryProps.phewasCategoryFilter];
    }
    return queryProps;
  }
  _stringifyQueryProps(newQueryParams) {
    const { history } = this.props;
    history.replace({
      ...history.location,
      search: queryString.stringify(newQueryParams),
    });
  }
  render() {
    const { match } = this.props;
    const { variantId } = match.params;
    const [chromosome, positionString] = variantId.split('_');
    const position = parseInt(positionString, 10);
    const {
      phewasTraitFilter: phewasTraitFilterUrl,
      phewasCategoryFilter: phewasCategoryFilterUrl,
    } = this._parseQueryProps();
    return (
      <BasePage>
        <ScrollToTop />
        <Helmet>
          <title>{variantId}</title>
        </Helmet>
        <Query query={variantPageQuery} variables={{ variantId }}>
          {({ loading, error, data }) => {
            const isVariantWithInfo = hasInfo(data);
            const isGeneVariant = hasAssociatedGenes(data);
            const isTagVariant = hasAssociatedIndexVariants(data);
            const isIndexVariant = hasAssociatedTagVariants(data);

            const variantInfo = isVariantWithInfo
              ? transformVariantInfo(data)
              : {};
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
                          <Link
                            to={`/gene/${variantInfo.nearestCodingGene.id}`}
                          >
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
                <PheWASSection
                  variantId={variantId}
                  phewasTraitFilterUrl={phewasTraitFilterUrl}
                  phewasCategoryFilterUrl={phewasCategoryFilterUrl}
                  handlePhewasTraitFilter={this.handlePhewasTraitFilter}
                  handlePhewasCategoryFilter={this.handlePhewasCategoryFilter}
                  isIndexVariant={isIndexVariant}
                  isTagVariant={isTagVariant}
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
  }
}

export default VariantPage;
