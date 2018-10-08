import React from 'react';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
import { findDOMNode } from 'react-dom';

import { Gecko } from 'ot-charts';
import {
  PageTitle,
  Typography,
  SectionHeading,
  BrowserControls,
  PlotContainer,
  PlotContainerSection,
  Button,
  commaSeparate,
  downloadPNG,
} from 'ot-ui';

import BasePage from './BasePage';
import LocusSelection from '../components/LocusSelection';
import LocusTable from '../components/LocusTable';
import locusScheme, {
  LOCUS_SCHEME,
  LOCUS_FINEMAPPING,
} from '../logic/locusScheme';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

function hasData(data) {
  return data && data.gecko;
}

const FullWidthText = ({ children }) => (
  <div style={{ width: '100%', textAlign: 'center' }}>
    <Typography variant="subheading">{children}</Typography>
  </div>
);

const geckoQuery = gql`
  query GeckoQuery($chromosome: String!, $start: Long!, $end: Long!) {
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

const ZOOM_LIMIT = 2000000;
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

    const newGap =
      gap * ZOOM_FACTOR > ZOOM_LIMIT ? ZOOM_LIMIT : gap * ZOOM_FACTOR;
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
  handleClick = (d, type, point) => {
    let {
      selectedGenes,
      selectedTagVariants,
      selectedIndexVariants,
      selectedStudies,
      ...rest
    } = this._parseQueryProps();
    switch (type) {
      case 'gene':
        if (!selectedGenes || !selectedGenes.find(d2 => d2 === d.id)) {
          selectedGenes = [d.id, ...(selectedGenes || [])];
        }
        break;
      case 'tagVariant':
        if (
          !selectedTagVariants ||
          !selectedTagVariants.find(d2 => d2 === d.id)
        ) {
          selectedTagVariants = [d.id, ...(selectedTagVariants || [])];
        }
        break;
      case 'indexVariant':
        if (
          !selectedIndexVariants ||
          !selectedIndexVariants.find(d2 => d2 === d.id)
        ) {
          selectedIndexVariants = [d.id, ...(selectedIndexVariants || [])];
        }
        break;
      case 'study':
        if (!selectedStudies || !selectedStudies.find(d2 => d2 === d.studyId)) {
          selectedStudies = [d.studyId, ...(selectedStudies || [])];
        }
        break;
      default:
    }
    const newQueryParams = {
      selectedGenes,
      selectedTagVariants,
      selectedIndexVariants,
      selectedStudies,
      ...rest,
    };
    this._stringifyQueryProps(newQueryParams);
  };
  handleMousemove = (d, type, point) => {};
  handleDeleteGene = id => () => {
    const { selectedGenes, ...rest } = this._parseQueryProps();
    const newSelected = selectedGenes
      ? selectedGenes.filter(d => d !== id)
      : [];
    const newQueryParams = {
      ...rest,
    };
    if (newSelected.length > 0) {
      newQueryParams.selectedGenes = newSelected;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleDeleteTagVariant = id => () => {
    const { selectedTagVariants, ...rest } = this._parseQueryProps();
    const newSelected = selectedTagVariants
      ? selectedTagVariants.filter(d => d !== id)
      : [];
    const newQueryParams = {
      ...rest,
    };
    if (newSelected.length > 0) {
      newQueryParams.selectedTagVariants = newSelected;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleDeleteIndexVariant = id => () => {
    const { selectedIndexVariants, ...rest } = this._parseQueryProps();
    const newSelected = selectedIndexVariants
      ? selectedIndexVariants.filter(d => d !== id)
      : [];
    const newQueryParams = {
      ...rest,
    };
    if (newSelected.length > 0) {
      newQueryParams.selectedIndexVariants = newSelected;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleDeleteStudy = id => () => {
    const { selectedStudies, ...rest } = this._parseQueryProps();
    const newSelected = selectedStudies
      ? selectedStudies.filter(d => d !== id)
      : [];
    const newQueryParams = {
      ...rest,
    };
    if (newSelected.length > 0) {
      newQueryParams.selectedStudies = newSelected;
    }
    this._stringifyQueryProps(newQueryParams);
  };
  handleDisplayTypeChange = event => {
    const { displayType, ...rest } = this._parseQueryProps();
    const newDisplayTypeValue = event.target.value;
    reportAnalyticsEvent({
      category: 'visualisation',
      action: 'filter',
      label: 'locus:display-type',
      value: newDisplayTypeValue,
    });
    const newQueryParams = {
      displayType: newDisplayTypeValue,
      ...rest,
    };
    this._stringifyQueryProps(newQueryParams);
  };
  handleDisplayFinemappingChange = event => {
    const { displayFinemapping, ...rest } = this._parseQueryProps();
    const newDisplayFinemappingValue = event.target.value;
    reportAnalyticsEvent({
      category: 'visualisation',
      action: 'filter',
      label: 'locus:display-finemapping',
      value: newDisplayFinemappingValue,
    });
    const newQueryParams = {
      displayFinemapping: newDisplayFinemappingValue,
      ...rest,
    };
    this._stringifyQueryProps(newQueryParams);
  };
  render() {
    const {
      start,
      end,
      chromosome,
      displayType,
      displayFinemapping,
      selectedGenes,
      selectedTagVariants,
      selectedIndexVariants,
      selectedStudies,
    } = this._parseQueryProps();
    const locationString = this._locationString();
    const displayTypeValue = displayType ? displayType : LOCUS_SCHEME.ALL_GENES;
    const displayFinemappingValue = displayFinemapping
      ? displayFinemapping
      : LOCUS_FINEMAPPING.ALL;
    const subheading = `What genetic evidence is there within this locus?`;
    const geckoPlot = React.createRef();
    return (
      <BasePage>
        <Helmet>
          <title>{locationString}</title>
        </Helmet>
        <PageTitle>Locus {locationString}</PageTitle>
        <SectionHeading
          heading="Associations"
          subheading={subheading}
          entities={[
            {
              type: 'study',
              fixed: selectedStudies,
            },
            {
              type: 'indexVariant',
              fixed: selectedIndexVariants,
            },
            {
              type: 'tagVariant',
              fixed: selectedTagVariants,
            },
            {
              type: 'gene',
              fixed: selectedGenes,
            },
          ]}
        />
        <Query
          query={geckoQuery}
          variables={{ chromosome, start, end }}
          fetchPolicy="network-only"
        >
          {({ loading, error, data }) => {
            const isValidLocus = hasData(data);
            const {
              lookups,
              plot,
              rows,
              isEmpty,
              isEmptyFiltered,
            } = locusScheme({
              scheme: displayTypeValue,
              finemappingOnly:
                displayFinemappingValue === LOCUS_FINEMAPPING.FINEMAPPING_ONLY,
              data: isValidLocus ? data.gecko : null,
              selectedGenes,
              selectedTagVariants,
              selectedIndexVariants,
              selectedStudies,
            });
            return (
              <React.Fragment>
                <PlotContainer
                  loading={loading}
                  error={error}
                  left={
                    <BrowserControls
                      handleZoomIn={this.handleZoomIn}
                      handleZoomOut={this.handleZoomOut}
                      handlePanLeft={this.handlePanLeft}
                      handlePanRight={this.handlePanRight}
                      handleDisplayTypeChange={this.handleDisplayTypeChange}
                      handleDisplayFinemappingChange={
                        this.handleDisplayFinemappingChange
                      }
                      displayTypeValue={displayTypeValue}
                      displayTypeOptions={[
                        {
                          value: LOCUS_SCHEME.ALL_GENES,
                          label: 'Show selection and all genes',
                        },
                        {
                          value: LOCUS_SCHEME.CHAINED,
                          label: 'Show selection',
                        },
                        {
                          value: LOCUS_SCHEME.ALL,
                          label: 'Show all data in locus',
                        },
                      ]}
                      displayFinemappingValue={displayFinemappingValue}
                      displayFinemappingOptions={[
                        {
                          value: LOCUS_FINEMAPPING.ALL,
                          label: 'Show expansion by LD and finemapping',
                        },
                        {
                          value: LOCUS_FINEMAPPING.FINEMAPPING_ONLY,
                          label: 'Show expansion by finemapping only',
                        },
                      ]}
                      disabledZoomOut={end - start >= ZOOM_LIMIT}
                    />
                  }
                  right={
                    <Button
                      variant="outlined"
                      onClick={() => {
                        reportAnalyticsEvent({
                          category: 'visualisation',
                          action: 'download',
                          label: 'locus:png',
                        });
                        downloadPNG({
                          canvasNode: findDOMNode(
                            geckoPlot.current
                          ).querySelector('canvas'),
                          filenameStem: locationString,
                        });
                      }}
                    >
                      PNG
                    </Button>
                  }
                >
                  {isEmptyFiltered ? (
                    isEmpty ? (
                      <PlotContainerSection>
                        <FullWidthText>
                          There are no associations in this locus.
                        </FullWidthText>
                      </PlotContainerSection>
                    ) : (
                      <PlotContainerSection>
                        <FullWidthText>
                          There are associations in this locus, but none match
                          your filters. Try removing some filters.
                        </FullWidthText>
                      </PlotContainerSection>
                    )
                  ) : null}
                  <PlotContainerSection>
                    <LocusSelection
                      {...{
                        selectedGenes,
                        selectedTagVariants,
                        selectedIndexVariants,
                        selectedStudies,
                      }}
                      lookups={lookups}
                      handleDeleteGene={this.handleDeleteGene}
                      handleDeleteTagVariant={this.handleDeleteTagVariant}
                      handleDeleteIndexVariant={this.handleDeleteIndexVariant}
                      handleDeleteStudy={this.handleDeleteStudy}
                    />
                  </PlotContainerSection>

                  <Gecko
                    ref={geckoPlot}
                    data={plot}
                    start={start}
                    end={end}
                    showGeneVerticals={displayTypeValue === LOCUS_SCHEME.ALL}
                    selectedGenes={selectedGenes}
                    selectedTagVariants={selectedTagVariants}
                    selectedIndexVariants={selectedIndexVariants}
                    selectedStudies={selectedStudies}
                    handleClick={this.handleClick}
                    handleMousemove={this.handleMousemove}
                  />
                </PlotContainer>
                <LocusTable
                  loading={loading}
                  error={error}
                  data={rows}
                  filenameStem={`${chromosome}-${start}-${end}-locus`}
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
    if (queryProps.start) {
      queryProps.start = parseInt(queryProps.start, 10);
    }
    if (queryProps.end) {
      queryProps.end = parseInt(queryProps.end, 10);
    }

    // single values need to be put in lists
    if (queryProps.selectedGenes) {
      queryProps.selectedGenes = Array.isArray(queryProps.selectedGenes)
        ? queryProps.selectedGenes
        : [queryProps.selectedGenes];
    }
    if (queryProps.selectedTagVariants) {
      queryProps.selectedTagVariants = Array.isArray(
        queryProps.selectedTagVariants
      )
        ? queryProps.selectedTagVariants
        : [queryProps.selectedTagVariants];
    }
    if (queryProps.selectedIndexVariants) {
      queryProps.selectedIndexVariants = Array.isArray(
        queryProps.selectedIndexVariants
      )
        ? queryProps.selectedIndexVariants
        : [queryProps.selectedIndexVariants];
    }
    if (queryProps.selectedStudies) {
      queryProps.selectedStudies = Array.isArray(queryProps.selectedStudies)
        ? queryProps.selectedStudies
        : [queryProps.selectedStudies];
    }
    if (queryProps.displayType) {
      queryProps.displayType = parseInt(queryProps.displayType, 10);
    }
    if (queryProps.displayFinemapping) {
      queryProps.displayFinemapping = parseInt(
        queryProps.displayFinemapping,
        10
      );
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
