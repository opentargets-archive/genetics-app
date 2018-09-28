import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import queryString from 'query-string';
import gql from 'graphql-tag';

import { PageTitle, SectionHeading, SubHeading, MultiSelect } from 'ot-ui';

import BasePage from './BasePage';
import ScrollToTop from '../components/ScrollToTop';
import ManhattansTable from '../components/ManhattansTable';
import SearchOption from '../components/SearchOption';

const topOverlappedStudiesQuery = gql`
  query TopOverlappedStudiesQuery($studyId: String!, $studyIds: [String!]!) {
    manhattan(studyId: $studyId) {
      associations {
        variantId
        variantRsId
        pval
        chromosome
        position
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

function hasData(data) {
  return (
    data &&
    data.manhattan &&
    data.manhattan.associations &&
    data.topOverlappedStudies
  );
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
  render() {
    const { studyId } = this.props.match.params;
    const { studyIds } = this._parseQueryProps();
    return (
      <BasePage>
        <ScrollToTop onRouteChange />
        <Helmet>
          <title>Compare studies</title>
        </Helmet>
        <PageTitle>Compare studies</PageTitle>

        <Query
          query={topOverlappedStudiesQuery}
          variables={{ studyId, studyIds: [studyId, ...studyIds] }}
          fetchPolicy="network-only"
        >
          {({ loading, error, data }) => {
            if (hasData(data)) {
              const {
                topOverlappedStudies,
                overlapInfoForStudy: overlappingStudies,
              } = data;
              const {
                study: studyInfo,
                topStudiesByLociOverlap: topStudies,
              } = topOverlappedStudies;
              const { studyIds: studySelectValue } = this._parseQueryProps();

              // select
              const rootStudyTop = topStudies.find(
                d => d.study.studyId === studyId
              );
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

              // table
              const variantIntersectionSet = overlappingStudies
                ? overlappingStudies.variantIntersectionSet
                : [];
              const transformOverlaps = d => ({
                ...d.study,
                associations: d.overlaps
                  .map(o => {
                    const [chromosome, position] = o.variantIdB.split('_');
                    return {
                      ...o,
                      chromosome,
                      position,
                      variantId: o.variantIdB,
                      inIntersection:
                        variantIntersectionSet.indexOf(o.variantIdA) >= 0,
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
                  const [chromosome, position] = d.split('_');
                  return {
                    variantId: d,
                    chromosome,
                    position,
                    inIntersection: true,
                  };
                }),
              };
              const rootStudy = transformOverlaps(overlapsRootStudy);
              const studies = overlapsStudies.map(transformOverlaps);
              return (
                <React.Fragment>
                  <SubHeading>
                    {`${studyInfo.traitReported} (${
                      studyInfo.pubAuthor
                    } et al ${new Date(studyInfo.pubDate).getFullYear()}) `}
                    <em>{`${studyInfo.pubJournal} `}</em>
                    <a
                      href={`http://europepmc.org/abstract/med/${
                        studyInfo.pmid
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {studyInfo.pmid}
                    </a>
                  </SubHeading>
                  <SectionHeading
                    heading={`Independently-associated loci coinciding with across ${
                      studyIds.length
                    } studies`}
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
                  <SubHeading>Top overlapping studies</SubHeading>

                  <ManhattansTable
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
                  />
                </React.Fragment>
              );
            } else {
              return null;
            }
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
