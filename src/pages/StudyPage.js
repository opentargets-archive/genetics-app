import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import {
  PageTitle,
  SubHeading,
  DownloadSVGPlot,
  SectionHeading,
  Button,
} from 'ot-ui';
import { Manhattan } from 'ot-charts';

import BasePage from './BasePage';
import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import ScrollToTop from '../components/ScrollToTop';
import withTooltip from '../components/withTooltip';

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

class StudyPage extends React.Component {
  render() {
    const { studyId } = this.props.match.params;
    let manhattanPlot = React.createRef();
    const ManhattanWithTooltip = withTooltip(Manhattan, tableColumns(studyId));
    return (
      <BasePage>
        <ScrollToTop onRouteChange />
        <Helmet>
          <title>{studyId}</title>
        </Helmet>

        <Query
          query={manhattanQuery}
          variables={{ studyId }}
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
                    <Link
                      to={`/study-comparison/${studyId}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Button gradient>Compare to related studies</Button>
                    </Link>
                  </Fragment>
                ) : null}
                {hasAssociations(data) ? (
                  <Fragment>
                    <SectionHeading
                      heading="Independently-associated loci"
                      subheading={`Found ${significantLoci(
                        data
                      )} loci with genome-wide
                    significance (p-value < 5e-8)`}
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
                      studyId={studyId}
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
  }
}

export default StudyPage;
