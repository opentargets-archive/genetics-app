import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';

import { Gecko } from 'ot-charts';
import {
  PageTitle,
  Heading,
  SubHeading,
  BrowserControls,
  commaSeparate,
} from 'ot-ui';

import BasePage from './BasePage';

function hasData(data) {
  return data && data.gecko;
}

function transformData(data) {
  const {
    genes,
    geneTagVariants,
    tagVariantIndexVariantStudies,
    ...rest
  } = data.gecko;
  const { tagVariants, indexVariants, studies } = rest;

  // gene exons come as flat list, rendering expects list of pairs
  const genesWithExonPairs = genes.map(d => ({
    ...d,
    exons: d.exons.reduce((result, value, index, array) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }
      return result;
    }, []),
  }));

  // geneTagVariants come with ids only, but need position info for gene and tagVariant
  const geneDict = {};
  const tagVariantDict = {};
  genes.forEach(d => (geneDict[d.id] = d));
  tagVariants.forEach(d => (tagVariantDict[d.id] = d));
  const geneTagVariantsWithPosition = geneTagVariants.map(d => ({
    ...d,
    geneTss: geneDict[d.geneId].tss,
    tagVariantPosition: tagVariantDict[d.tagVariantId].position,
  }));

  // tagVariantIndexVariantStudies come with ids only, but need position info for tagVariant and indexVariant
  const indexVariantDict = {};
  const studyDict = {};
  indexVariants.forEach(d => (indexVariantDict[d.id] = d));
  studies.forEach(d => (studyDict[d.studyId] = d));
  const tagVariantIndexVariantStudiesWithPosition = tagVariantIndexVariantStudies.map(
    d => ({
      ...d,
      tagVariantPosition: tagVariantDict[d.tagVariantId].position,
      indexVariantPosition: indexVariantDict[d.indexVariantId].position,
      traitReported: studyDict[d.studyId].traitReported,
    })
  );

  return {
    gecko: {
      genes: genesWithExonPairs,
      geneTagVariants: geneTagVariantsWithPosition,
      tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesWithPosition,
      ...rest,
    },
  };
}

const geckoQuery = gql`
  query GeckoQuery($chromosome: String, $start: Int, $end: Int) {
    gecko(chromosome: $chromosome, start: $start, end: $end) {
      genes {
        id
        symbol
        tss
        start
        end
        exons
      }
      tagVariants {
        id
        rsId
        position
      }
      indexVariants {
        id
        rsId
        position
      }
      studies {
        studyId
        traitReported
        pubAuthor
        pubDate
        pubJournal
        pmid
      }
      geneTagVariants {
        geneId
        tagVariantId
        overallScore
      }
      tagVariantIndexVariantStudies {
        tagVariantId
        indexVariantId
        studyId
        r2
        pval
        posteriorProbability
      }
    }
  }
`;

const ZOOM_FACTOR = 1.25;
const PAN_FACTOR = 0.1;

class LocusPage extends React.Component {
  handleZoomIn = () => {
    const { start, end, ...rest } = this._parseQueryProps();
    const gap = end - start;
    const midPoint = (start + end) / 2;
    const newGap = gap / ZOOM_FACTOR;
    const newStart = Math.round(midPoint - newGap / 2);
    const newEnd = Math.round(midPoint + newGap / 2);
    const newQueryParams = {
      ...rest,
      start: newStart,
      end: newEnd,
    };
    this._stringifyQueryProps(newQueryParams);
  };
  handleZoomOut = () => {
    const { start, end, ...rest } = this._parseQueryProps();
    const gap = end - start;
    const midPoint = (start + end) / 2;
    const newGap = gap * ZOOM_FACTOR;
    const newStart = Math.round(midPoint - newGap / 2);
    const newEnd = Math.round(midPoint + newGap / 2);
    const newQueryParams = {
      ...rest,
      start: newStart,
      end: newEnd,
    };
    this._stringifyQueryProps(newQueryParams);
  };
  handlePanLeft = () => {
    const { start, end, ...rest } = this._parseQueryProps();
    const gap = end - start;
    const jump = Math.round(gap * PAN_FACTOR);
    const newStart = start - jump;
    const newEnd = end - jump;
    const newQueryParams = {
      ...rest,
      start: newStart,
      end: newEnd,
    };
    this._stringifyQueryProps(newQueryParams);
  };
  handlePanRight = () => {
    const { start, end, ...rest } = this._parseQueryProps();
    const gap = end - start;
    const jump = Math.round(gap * PAN_FACTOR);
    const newStart = start + jump;
    const newEnd = end + jump;
    const newQueryParams = {
      ...rest,
      start: newStart,
      end: newEnd,
    };
    this._stringifyQueryProps(newQueryParams);
  };
  render() {
    const { start, end, chromosome } = this._parseQueryProps();
    const locationString = this._locationString();
    return (
      <BasePage>
        <Helmet>
          <title>{locationString}</title>
        </Helmet>
        <PageTitle>Locus {locationString}</PageTitle>
        <hr />
        <Heading>Associations</Heading>
        <SubHeading>
          What genetic evidence is there within this locus?
        </SubHeading>
        <BrowserControls
          handleZoomIn={this.handleZoomIn}
          handleZoomOut={this.handleZoomOut}
          handlePanLeft={this.handlePanLeft}
          handlePanRight={this.handlePanRight}
        />
        <Query
          query={geckoQuery}
          variables={{ chromosome, start, end }}
          fetchPolicy="network-only"
        >
          {({ loading, error, data }) => {
            return hasData(data) ? (
              <Gecko data={transformData(data).gecko} start={start} end={end} />
            ) : null;
          }}
        </Query>
      </BasePage>
    );
  }
  _parseQueryProps() {
    const { history } = this.props;
    const queryProps = queryString.parse(history.location.search);
    if (queryProps.start) {
      queryProps.start = parseInt(queryProps.start, 10);
    }
    if (queryProps.end) {
      queryProps.end = parseInt(queryProps.end, 10);
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
  _locationString() {
    const { chromosome, start, end } = this._parseQueryProps();
    return `${chromosome}:${commaSeparate(start)}-${commaSeparate(end)}`;
  }
}

export default LocusPage;
