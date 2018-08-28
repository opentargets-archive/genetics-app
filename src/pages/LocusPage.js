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

const geckoQuery = gql`
  query GeckoQuery($chromosome: String, $start: Int, $end: Int) {
    gecko(chromosome: $chromosome, start: $start, end: $end) {
      genes {
        id
        symbol
        tss
        start
        end
        forwardStrand
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
      # studies {
      #   studyId
      #   traitReported
      #   pubAuthor
      #   pubDate
      #   pubJournal
      #   pmid
      # }
      # geneTagVariants {
      #   geneId
      #   geneSymbol
      #   geneTss
      #   tagVariantId
      #   tagVariantPosition
      #   overallScore
      # }
      # tagVariantIndexVariants {
      #   tagVariantId
      #   tagVariantPosition
      #   indexVariantId
      #   indexVariantPosition
      #   r2
      # }
      # indexVariantStudies {

      # }
    }
  }
`;

const ZOOM_FACTOR = 1.25;
const PAN_FACTOR = 0.2;

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
            return <Gecko data={data.gecko} start={start} end={end} />;
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
