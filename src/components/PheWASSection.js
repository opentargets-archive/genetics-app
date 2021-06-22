import React from 'react';
import { Query } from 'react-apollo';
import _ from 'lodash';
import { loader } from 'graphql.macro';

import { DownloadSVGPlot, ListTooltip, SectionHeading } from 'ot-ui';
import { withTooltip } from 'ot-charts';
import PheWAS from './PheWAS';

import PheWASTable, { tableColumns } from '../components/PheWASTable';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

const PHEWAS_QUERY = loader('../queries/PheWASQuery.gql');

function hasAssociations(data) {
  return (
    data &&
    data.pheWAS &&
    data.pheWAS.associations &&
    data.pheWAS.associations.length > 0
  );
}

function transformPheWAS(data) {
  return data.pheWAS.associations.map(d => {
    const { study, ...rest } = d;
    const { studyId, traitReported, traitCategory, pubDate, pubAuthor, pmid } =
      study ?? {};
    return {
      studyId,
      traitReported,
      traitCategory,
      pubDate,
      pubAuthor,
      pmid,
      ...rest,
    };
  });
}

class PheWASSection extends React.Component {
  render() {
    let pheWASPlot = React.createRef();
    const {
      variantId,
      phewasTraitFilterUrl,
      phewasCategoryFilterUrl,
      handlePhewasTraitFilter,
      handlePhewasCategoryFilter,
      isIndexVariant,
      isTagVariant,
    } = this.props;
    const [chromosome, positionString] = variantId.split('_');
    const position = parseInt(positionString, 10);
    return (
      <Query query={PHEWAS_QUERY} variables={{ variantId }}>
        {({ loading, error, data }) => {
          const isPheWASVariant = hasAssociations(data);
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
          const pheWASAssociations = isPheWASVariant
            ? transformPheWAS(data)
            : [];
          // phewas - filtered
          const pheWASAssociationsFiltered = pheWASAssociations.filter(d => {
            return (
              (phewasTraitFilterUrl
                ? phewasTraitFilterUrl.indexOf(d.traitReported) >= 0
                : true) &&
              (phewasCategoryFilterUrl
                ? phewasCategoryFilterUrl.indexOf(d.traitCategory) >= 0
                : true)
            );
          });
          // phewas - filters
          const phewasTraitFilterOptions = _.sortBy(
            _.uniq(pheWASAssociationsFiltered.map(d => d.traitReported)).map(
              d => ({
                label: d,
                value: d,
                selected: phewasTraitFilterUrl
                  ? phewasTraitFilterUrl.indexOf(d) >= 0
                  : false,
              })
            ),
            [d => !d.selected, 'value']
          );
          const phewasTraitFilterValue = phewasTraitFilterOptions.filter(
            d => d.selected
          );
          const phewasCategoryFilterOptions = _.sortBy(
            _.uniq(pheWASAssociationsFiltered.map(d => d.traitCategory)).map(
              d => ({
                label: d,
                value: d,
                selected: phewasCategoryFilterUrl
                  ? phewasCategoryFilterUrl.indexOf(d) >= 0
                  : false,
              })
            ),
            [d => !d.selected, 'value']
          );
          const phewasCategoryFilterValue = phewasCategoryFilterOptions.filter(
            d => d.selected
          );

          return (
            <React.Fragment>
              <SectionHeading
                heading="PheWAS"
                subheading="Which traits are associated with this variant in the UK Biobank, FinnGen, and/or GWAS Catalog summary statistics repository? Only traits with P-value < 0.05 are returned."
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
                  reportDownloadEvent={() => {
                    reportAnalyticsEvent({
                      category: 'visualisation',
                      action: 'download',
                      label: `variant:phewas:svg`,
                    });
                  }}
                >
                  <PheWASWithTooltip
                    significancePVal={0.05 / data.pheWAS.totalGWASStudies}
                    associations={pheWASAssociationsFiltered}
                    ref={pheWASPlot}
                  />
                </DownloadSVGPlot>
              ) : null}
              <PheWASTable
                associations={pheWASAssociationsFiltered}
                {...{
                  loading,
                  error,
                  variantId,
                  chromosome,
                  position,
                  isIndexVariant,
                  isTagVariant,
                }}
                traitFilterValue={phewasTraitFilterValue}
                traitFilterOptions={phewasTraitFilterOptions}
                traitFilterHandler={handlePhewasTraitFilter}
                categoryFilterValue={phewasCategoryFilterValue}
                categoryFilterOptions={phewasCategoryFilterOptions}
                categoryFilterHandler={handlePhewasCategoryFilter}
              />
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default PheWASSection;
