import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PageTitle, Heading, SubHeading, DownloadSVGPlot } from 'ot-ui';
import { Manhattan } from 'ot-charts';

import BasePage from './BasePage';
import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import withTooltip from '../components/withTooltip';

const ManhattanWithTooltip = withTooltip(Manhattan, tableColumns);
const SIGNIFICANCE = 5e-8;

function hasAssociations(data) {
  return (
    data &&
    data.manhattan &&
    data.manhattan.associations &&
    data.manhattan.associations.length > 0
  );
}

function transformAssociations(data) {
  return {
    associations: data.manhattan.associations.map(d => {
      const { variantId, variantRsId, ...rest } = d;
      return {
        ...rest,
        indexVariantId: variantId,
        indexVariantRsId: variantRsId,
      };
    }),
  };
}

function hasStudyInfo(data) {
  return data && data.studyInfo;
}

function significantLoci(data) {
  return data.manhattan.associations.filter(d => d.pval < SIGNIFICANCE).length;
}

const manhattanQuery = gql`
  query StudyPageQuery($studyId: String!) {
    studyInfo(studyId: $studyId) {
      studyId
      traitReported
      pubAuthor
      pubDate
      pubJournal
      pmid
    }
    manhattan(studyId: $studyId) {
      associations {
        variantId
        variantRsId
        pval
        chromosome
        position
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
  }
`;

const StudyPage = ({ match }) => {
  let manhattanPlot = React.createRef();
  const { studyId } = match.params;
  return (
    <BasePage>
      <Helmet>
        <title>{studyId}</title>
      </Helmet>

      <Query
        query={manhattanQuery}
        variables={{ studyId: match.params.studyId }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data }) => {
          const manhattan = hasAssociations(data)
            ? transformAssociations(data)
            : { associations: [] };
          return (
            <Fragment>
              {hasStudyInfo(data) ? (
                <Fragment>
                  <PageTitle>{data.studyInfo.traitReported}</PageTitle>
                  <SubHeading>
                    {`${data.studyInfo.pubAuthor} et al (${new Date(
                      data.studyInfo.pubDate
                    ).getFullYear()}) `}
                    <em>{`${data.studyInfo.pubJournal} `}</em>
                    <a
                      href={`http://europepmc.org/abstract/med/${
                        data.studyInfo.pmid
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {data.studyInfo.pmid}
                    </a>
                  </SubHeading>
                  <hr />
                </Fragment>
              ) : null}
              {hasAssociations(data) ? (
                <Fragment>
                  <Heading>Independently-associated loci</Heading>
                  <SubHeading>
                    {`Found ${significantLoci(data)} loci with genome-wide
                  significance (p-value < 5e-8)`}
                  </SubHeading>
                  <DownloadSVGPlot
                    svgContainer={manhattanPlot}
                    filenameStem={`${studyId}-independently-associated-loci`}
                  >
                    <ManhattanWithTooltip
                      data={manhattan}
                      ref={manhattanPlot}
                    />
                  </DownloadSVGPlot>
                  <ManhattanTable
                    data={manhattan.associations}
                    filenameStem={`${studyId}-independently-associated-loci`}
                  />
                </Fragment>
              ) : null}
            </Fragment>
          );
        }}
      </Query>
    </BasePage>
  );
};

export default StudyPage;
