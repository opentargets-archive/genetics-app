import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from '@apollo/client/react/components';
import queryString from 'query-string';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import { SectionHeading, Autocomplete } from '../ot-ui-components';

import BasePage from './BasePage';
import ScrollToTop from '../components/ScrollToTop';
import ManhattansTable from '../components/ManhattansTable';
import ManhattansVariantsTable from '../components/ManhattansVariantsTable';
import StudyComparisonOption from '../components/StudyComparisonOption';
import ErrorBoundary from '../components/ErrorBoundary';

import STUDIES_PAGE_QUERY from '../queries/StudiesPageQuery.gql';

function hasStudyInfo(data) {
  return data && data.studyInfo;
}

function hasManhattan(data) {
  return data && data.manhattan && data.manhattan.associations;
}

function hasTopOverlappedStudies(data) {
  return data && data.topOverlappedStudies;
}

function hasOverlapInfoForStudy(data) {
  return data && data.overlapInfoForStudy;
}

function getStudiesTableData(data, studyId, studyIds) {
  const EMPTY_CASE = {
    studySelectOptions: [],
    pileupPseudoStudy: { pileup: true, associations: [] },
    variantIntersectionSet: hasOverlapInfoForStudy(data)
      ? data.overlapInfoForStudy.variantIntersectionSet
      : [],
    rootStudy: { associations: [] },
    studies: [],
  };
  if (!hasOverlapInfoForStudy(data) || !hasTopOverlappedStudies(data)) {
    return EMPTY_CASE;
  }
  const { topOverlappedStudies, overlapInfoForStudy: overlappingStudies } =
    data;
  const { topStudiesByLociOverlap: topStudies } = topOverlappedStudies;

  // select
  const rootStudyTop = topStudies.find((d) => d.study.studyId === studyId);

  const topStudiesExcludingRoot = topStudies.filter((d) => {
    if (d.study !== null) return d.study.studyId !== studyId;
    else return null;
  });
  if (!rootStudyTop) {
    // handle case of manhattan data but no ld/fine-mapping (eg. GCST004132)
    if (
      topStudiesExcludingRoot.length === 0 &&
      hasManhattan(data) &&
      hasStudyInfo(data)
    ) {
      const associationsRoot = data.manhattan.associations.map((d) => ({
        ...d,
        ...d.variant,
        variantId: d.variant.id,
        inIntersection: true,
      }));
      const associationsPileup = associationsRoot.map((d) => ({
        ...d,
        pileup: true,
      }));
      return {
        ...EMPTY_CASE,
        pileupPseudoStudy: { pileup: true, associations: associationsPileup },
        rootStudy: {
          ...data.studyInfo,
          associations: associationsRoot,
        },
      };
    } else {
      return EMPTY_CASE;
    }
  }

  const rootLociCount = rootStudyTop.numOverlapLoci;
  const studySelectOptions = topStudiesExcludingRoot
    .filter((d) => d.study.studyId !== studyId)
    .sort((a, b) => {
      // order by (selected, numOverlapLoci, studyId)
      const aSelected = studyIds.indexOf(a.study.studyId) >= 0;
      const bSelected = studyIds.indexOf(b.study.studyId) >= 0;

      if (aSelected !== bSelected) {
        return aSelected ? -1 : 1;
      }

      if (a.numOverlapLoci !== b.numOverlapLoci) {
        return b.numOverlapLoci - a.numOverlapLoci;
      }

      return a.study.studyId >= b.study.studyId;
    })
    .map((d) => ({
      ...d,
      selected: studyIds.indexOf(d.study.studyId) >= 0,
      count: d.numOverlapLoci,
      proportion: d.numOverlapLoci / rootLociCount,
    }));

  const variantIntersectionSet = overlappingStudies
    ? overlappingStudies.variantIntersectionSet
    : [];
  const transformOverlaps = (d) => ({
    ...d.study,
    associations: d.overlaps
      .map((o) => {
        const [chromosome, positionString] = o.variantIdB.split('_');
        const position = parseInt(positionString, 10);
        return {
          ...o,
          chromosome,
          position,
          variantId: o.variantIdB,
          inIntersection: variantIntersectionSet.indexOf(o.variantIdA) >= 0,
        };
      })
      .sort((a, b) => {
        return a.inIntersection === b.inIntersection
          ? a.position - b.position
          : a.inIntersection
          ? 1
          : -1;
      }),
  });
  const overlapsRootStudy = overlappingStudies
    ? overlappingStudies.overlappedVariantsForStudies.find(
        (d) => d.study.studyId === studyId
      )
    : null;
  const overlapsStudies = overlappingStudies
    ? overlappingStudies.overlappedVariantsForStudies.filter(
        (d) => d.study.studyId !== studyId
      )
    : [];
  const pileupPseudoStudy = {
    pileup: true,
    associations: variantIntersectionSet.map((d) => {
      const [chromosome, positionString] = d.split('_');
      const position = parseInt(positionString, 10);
      return {
        variantId: d,
        chromosome,
        position,
        inIntersection: true,
        pileup: true,
      };
    }),
  };
  const rootStudy = transformOverlaps(overlapsRootStudy);
  const studies = overlapsStudies.map(transformOverlaps);

  return {
    studySelectOptions,
    pileupPseudoStudy,
    variantIntersectionSet,
    rootStudy,
    studies,
  };
}

function getStudyInfo(data) {
  return data.studyInfo;
}

function getOverlappingVariants(
  data,
  variantIntersectionSet,
  studiesToCompare
) {
  if (!hasManhattan(data)) {
    return [];
  }
  return data.manhattan.associations
    .filter((d) =>
      studiesToCompare
        ? variantIntersectionSet.indexOf(d.variant.id) >= 0
        : true
    )
    .map((d) => {
      const { variant, ...rest } = d;
      return {
        ...rest,
        indexVariantId: variant.id,
        indexVariantRsId: variant.rsId,
        chromosome: variant.chromosome,
        position: variant.position,
      };
    });
}

const styles = (theme) => {
  return {
    section: {
      padding: theme.sectionPadding,
      textDecoration: 'none',
    },
  };
};

class StudiesPage extends React.Component {
  handleAddStudy = (studyId) => {
    const { studyIds, ...rest } = this._parseQueryProps();
    const newStudyIds = studyIds
      ? [studyId, ...studyIds.filter((d) => d !== studyId)]
      : [studyId];
    const newQueryParams = { ...rest };
    if (studyIds) {
      newQueryParams.studyIds = newStudyIds;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleDeleteStudy = (studyId) => () => {
    const { studyIds, ...rest } = this._parseQueryProps();
    const newStudyIds = studyIds ? studyIds.filter((d) => d !== studyId) : null;
    const newQueryParams = { ...rest };
    if (studyIds) {
      newQueryParams.studyIds = newStudyIds;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleChange = (newStudies) => {
    const { studyIds, ...rest } = this._parseQueryProps();
    const newQueryParams = { ...rest };
    if (newStudies && newStudies.length > 0) {
      newQueryParams.studyIds = newStudies.map((d) => d.study.studyId);
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleClick = (overlap) => {
    const { match, history } = this.props;
    const { studyId } = match.params;
    const { studyIds } = this._parseQueryProps();
    const { chromosome, position } = overlap;
    const mb = 1000000;
    // note: cannot pass selectedIndexVariant, since it may not be shared
    history.push(
      `/locus?${queryString.stringify({
        chromosome,
        start: position - mb,
        end: position + mb,
        selectedStudies: [studyId, ...studyIds],
      })}`
    );
  };
  render() {
    const { match } = this.props;
    const { studyId } = match.params;
    const { studyIds } = this._parseQueryProps();
    return (
      <BasePage>
        <ScrollToTop />
        <Helmet>
          <title>Compare studies</title>
        </Helmet>
        <ErrorBoundary>
          <Query
            query={STUDIES_PAGE_QUERY}
            variables={{ studyId, studyIds: [studyId, ...studyIds] }}
            fetchPolicy="network-only"
          >
            {({ loading, error, data }) => {
              const isStudyWithInfo = hasStudyInfo(data);
              const studyInfo = isStudyWithInfo ? getStudyInfo(data) : {};
              const { pubAuthor, pubDate, pubJournal } = studyInfo;
              const {
                studySelectOptions,
                pileupPseudoStudy,
                variantIntersectionSet,
                rootStudy,
                studies,
              } = getStudiesTableData(data, studyId, studyIds);
              const studySelectValue = studySelectOptions.filter(
                (d) => studyIds.indexOf(d.study.studyId) >= 0
              );
              const overlappingVariants = getOverlappingVariants(
                data,
                variantIntersectionSet,
                studies.length > 0
              );
              return (
                <Fragment>
                  <Typography variant="h4" color="textSecondary">
                    {studyInfo.traitReported}
                  </Typography>
                  <Typography variant="subtitle1">
                    {pubAuthor}{' '}
                    {pubDate ? `(${new Date(pubDate).getFullYear()})` : null}{' '}
                    {pubJournal ? <em>{pubJournal}</em> : null}
                  </Typography>

                  <SectionHeading
                    heading={`Compare overlapping studies`}
                    subheading={
                      isStudyWithInfo ? (
                        <Fragment>
                          Which independently-associated loci are shared between{' '}
                          <b>
                            {studyInfo.pubAuthor} (
                            {new Date(studyInfo.pubDate).getFullYear()})
                          </b>{' '}
                          and other studies?
                        </Fragment>
                      ) : null
                    }
                    entities={[
                      {
                        type: 'study',
                        fixed: true,
                      },
                      {
                        type: 'indexVariant',
                        fixed: false,
                      },
                    ]}
                  />
                  <ManhattansTable
                    loading={loading}
                    error={error}
                    select={
                      <Autocomplete
                        options={studySelectOptions}
                        value={studySelectValue}
                        getOptionLabel={(d) =>
                          `${d.study.traitReported} (${
                            d.study.pubAuthor
                          } ${new Date(d.study.pubDate).getFullYear()})`
                        }
                        getOptionValue={(d) => d.study.studyId}
                        handleSelectOption={this.handleChange}
                        placeholder="Add a study to compare..."
                        multiple
                        wide
                        OptionComponent={StudyComparisonOption}
                      />
                    }
                    studies={studies}
                    rootStudy={rootStudy}
                    pileupPseudoStudy={pileupPseudoStudy}
                    onDeleteStudy={this.handleDeleteStudy}
                    onClickIntersectionLocus={this.handleClick}
                  />
                  <ManhattansVariantsTable
                    loading={loading}
                    error={error}
                    data={overlappingVariants}
                    studyIds={[studyId, ...studyIds]}
                    filenameStem={`intersecting-independently-associated-loci`}
                  />
                </Fragment>
              );
            }}
          </Query>
        </ErrorBoundary>
      </BasePage>
    );
  }
  _parseQueryProps() {
    const { history } = this.props;
    const queryProps = queryString.parse(history.location.search);

    // single values need to be put in lists
    if (queryProps.studyIds) {
      queryProps.studyIds = Array.isArray(queryProps.studyIds)
        ? queryProps.studyIds
        : [queryProps.studyIds];
    } else {
      queryProps.studyIds = [];
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
}

export default withStyles(styles)(StudiesPage);
