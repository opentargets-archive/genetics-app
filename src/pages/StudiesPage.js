import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import queryString from 'query-string';
import gql from 'graphql-tag';

import { PageTitle, SectionHeading, SubHeading, MultiSelect } from 'ot-ui';

import BasePage from './BasePage';
import ScrollToTop from '../components/ScrollToTop';
import ManhattansTable from '../components/ManhattansTable';
import ManhattansVariantsTable from '../components/ManhattansVariantsTable';
import SearchOption from '../components/SearchOption';
import StudyInfo from '../components/StudyInfo';
import StudySize from '../components/StudySize';

const topOverlappedStudiesQuery = gql`
  query TopOverlappedStudiesQuery($studyId: String!, $studyIds: [String!]!) {
    studyInfo(studyId: $studyId) {
      studyId
      traitReported
      pubAuthor
      pubDate
      pubJournal
      pmid
      nInitial
      nReplication
      nCases
    }
    manhattan(studyId: $studyId) {
      associations {
        variant {
          id
          rsId
          chromosome
          position
        }
        pval
        credibleSetSize
        ldSetSize
        bestGenes {
          score
          gene {
            id
            symbol
          }
        }
      }
    }
    topOverlappedStudies(studyId: $studyId) {
      study {
        studyId
        traitReported
        pubAuthor
        pubDate
        pubJournal
        pmid
        nInitial
        nReplication
        nCases
      }
      topStudiesByLociOverlap {
        study {
          studyId
          traitReported
          pubAuthor
          pubDate
          pubJournal
          pmid
          nInitial
          nReplication
          nCases
        }
        numOverlapLoci
      }
    }
    overlapInfoForStudy(studyId: $studyId, studyIds: $studyIds) {
      study {
        studyId
        traitReported
        pubAuthor
        pubDate
        pubJournal
        pmid
        nInitial
        nReplication
        nCases
      }
      overlappedVariantsForStudies {
        study {
          studyId
          traitReported
          pubAuthor
          pubDate
          pubJournal
          pmid
          nInitial
          nReplication
          nCases
        }
        overlaps {
          variantIdA
          variantIdB
          overlapAB
          distinctA
          distinctB
        }
      }
      variantIntersectionSet
    }
  }
`;

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
  if (!hasOverlapInfoForStudy(data) || !hasTopOverlappedStudies(data)) {
    return {
      studySelectOptions: [],
      pileupPseudoStudy: { pileup: true, associations: [] },
      variantIntersectionSet: hasOverlapInfoForStudy(data)
        ? data.overlapInfoForStudy.variantIntersectionSet
        : [],
      rootStudy: { associations: [] },
      studies: [],
    };
  }
  const {
    topOverlappedStudies,
    overlapInfoForStudy: overlappingStudies,
  } = data;
  const { topStudiesByLociOverlap: topStudies } = topOverlappedStudies;

  // select
  const rootStudyTop = topStudies.find(d => d.study.studyId === studyId);
  const topStudiesExcludingRoot = topStudies.filter(
    d => d.study.id !== studyId
  );
  const rootLociCount = rootStudyTop.numOverlapLoci;
  const studySelectOptions = topStudiesExcludingRoot
    .filter(d => d.study.studyId !== studyId)
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
    .map(d => ({
      label: (
        <StudyOptionLabel
          study={d.study}
          overlappingLociCount={d.numOverlapLoci}
          rootOverlapProportion={d.numOverlapLoci / rootLociCount}
        />
      ),
      value: d.study.studyId,
    }));

  const variantIntersectionSet = overlappingStudies
    ? overlappingStudies.variantIntersectionSet
    : [];
  const transformOverlaps = d => ({
    ...d.study,
    associations: d.overlaps
      .map(o => {
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
        d => d.study.studyId === studyId
      )
    : null;
  const overlapsStudies = overlappingStudies
    ? overlappingStudies.overlappedVariantsForStudies.filter(
        d => d.study.studyId !== studyId
      )
    : [];
  const pileupPseudoStudy = {
    pileup: true,
    associations: variantIntersectionSet.map(d => {
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

function transformManhattansVariants(data, variantIntersectionSet) {
  if (!hasManhattan(data)) {
    return [];
  }
  return data.manhattan.associations
    .filter(d => variantIntersectionSet.indexOf(d.variant.id) >= 0)
    .map(d => {
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

const StudyOptionLabel = ({
  study,
  overlappingLociCount,
  rootOverlapProportion,
}) => (
  <SearchOption
    data={{
      ...study,
      overlappingLociCount,
      rootOverlapProportion,
      groupType: 'study-overlap',
    }}
  />
);

class StudiesPage extends React.Component {
  handleAddStudy = studyId => {
    const { studyIds, ...rest } = this._parseQueryProps();
    const newStudyIds = studyIds
      ? [studyId, ...studyIds.filter(d => d !== studyId)]
      : [studyId];
    const newQueryParams = { ...rest };
    if (studyIds) {
      newQueryParams.studyIds = newStudyIds;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleDeleteStudy = studyId => () => {
    const { studyIds, ...rest } = this._parseQueryProps();
    const newStudyIds = studyIds ? studyIds.filter(d => d !== studyId) : null;
    const newQueryParams = { ...rest };
    if (studyIds) {
      newQueryParams.studyIds = newStudyIds;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleChange = event => {
    const { studyIds, ...rest } = this._parseQueryProps();
    const newQueryParams = { ...rest };
    if (event.target.value && event.target.value.length > 0) {
      newQueryParams.studyIds = event.target.value;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleClick = overlap => {
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
    const { studyId } = this.props.match.params;
    const { studyIds } = this._parseQueryProps();
    return (
      <BasePage>
        <ScrollToTop onRouteChange />
        <Helmet>
          <title>Compare studies</title>
        </Helmet>

        <Query
          query={topOverlappedStudiesQuery}
          variables={{ studyId, studyIds: [studyId, ...studyIds] }}
          fetchPolicy="network-only"
        >
          {({ loading, error, data }) => {
            const isStudyWithInfo = hasStudyInfo(data);
            const { studyIds: studySelectValue } = this._parseQueryProps();
            const studyInfo = isStudyWithInfo ? getStudyInfo(data) : {};
            const {
              studySelectOptions,
              pileupPseudoStudy,
              variantIntersectionSet,
              rootStudy,
              studies,
            } = getStudiesTableData(data, studyId, studyIds);
            const manhattansVariants = transformManhattansVariants(
              data,
              variantIntersectionSet
            );
            return (
              <React.Fragment>
                <PageTitle>{studyInfo.traitReported}</PageTitle>
                <SubHeading
                  left={
                    isStudyWithInfo ? (
                      <StudyInfo studyInfo={data.studyInfo} />
                    ) : null
                  }
                  right={
                    isStudyWithInfo ? (
                      <StudySize studyInfo={data.studyInfo} />
                    ) : null
                  }
                />

                <SectionHeading
                  heading={`Compare overlapping studies`}
                  subheading={
                    isStudyWithInfo ? (
                      <React.Fragment>
                        Which independently-associated loci are shared between{' '}
                        <b>
                          {studyInfo.pubAuthor} (
                          {new Date(studyInfo.pubDate).getFullYear()})
                        </b>{' '}
                        and other studies?
                      </React.Fragment>
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
                    <MultiSelect
                      value={studySelectValue}
                      options={studySelectOptions}
                      handleChange={this.handleChange}
                      renderValue={() => {
                        return studySelectValue && studySelectValue.length > 0
                          ? `${studySelectValue.length} stud${
                              studySelectValue.length === 1 ? 'y' : 'ies'
                            } selected`
                          : 'Add a study to compare...';
                      }}
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
                  data={manhattansVariants}
                  studyIds={[studyId, ...studyIds]}
                  filenameStem={`intersecting-independently-associated-loci`}
                />
              </React.Fragment>
            );
          }}
        </Query>
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

export default StudiesPage;
