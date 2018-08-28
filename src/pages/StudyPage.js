import React from 'react';
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

function hasStudyInfo(data) {
  return data && data.studyInfo;
}

function significantLoci(data) {
  return data.manhattan.associations.filter(d => d.pval < SIGNIFICANCE).length;
}

const manhattanQuery = gql`
  {
    studyInfo(studyId: "GCT123") {
      studyId
      traitReported
      pubAuthor
      pubDate
      pubJournal
      pmid
    }
    manhattan(studyId: "GCT123") {
      associations {
        indexVariantId
        indexVariantRsId
        pval
        chromosome
        position
        credibleSetSize
        ldSetSize
        bestGenes
      }
    }
  }
`;

const StudyPage = ({ match }) => {
  let manhattanPlot = React.createRef();

  return (
    <BasePage>
      <Helmet>
        <title>{match.params.studyId}</title>
      </Helmet>

      <Query query={manhattanQuery} fetchPolicy="network-only">
        {({ loading, error, data }) => {
          return (
            <React.Fragment>
              {hasStudyInfo(data) ? (
                <React.Fragment>
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
                </React.Fragment>
              ) : null}
              {hasAssociations(data) ? (
                <React.Fragment>
                  <Heading>Independently-associated loci</Heading>
                  <SubHeading>
                    {`Found ${significantLoci(data)} loci with genome-wide
                  significance (p-value < 5e-8)`}
                  </SubHeading>
                  <DownloadSVGPlot
                    svgContainer={manhattanPlot}
                    filenameStem="independently-associated-loci"
                  >
                    <ManhattanWithTooltip
                      data={data.manhattan}
                      ref={manhattanPlot}
                    />
                  </DownloadSVGPlot>
                  <ManhattanTable data={data.manhattan.associations} />
                </React.Fragment>
              ) : null}
            </React.Fragment>
          );
        }}
      </Query>
    </BasePage>
  );
};

export default StudyPage;
