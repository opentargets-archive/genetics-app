import React from 'react';

import { Manhattan, chromosomesWithCumulativeLengths } from 'ot-charts';
import { SectionHeading, DownloadSVGPlot, ListTooltip } from 'ot-ui';

import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

const maxPos =
  chromosomesWithCumulativeLengths[chromosomesWithCumulativeLengths.length - 1]
    .cumulativeLength;
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
  // TODO: API should fix this
  const zeroPvals = data.manhattan.associations.filter(d => d.pval === 0);
  if (zeroPvals.length > 0) {
    console.error('Found zero pvalues in Manhattan data: ', zeroPvals);
  }

  return data.manhattan.associations.filter(d => d.pval > 0).map(d => {
    const { variant, ...rest } = d;
    const ch = chromosomesWithCumulativeLengths.find(
      ch => ch.name === variant.chromosome
    );

    return {
      ...rest,
      indexVariantId: variant.id,
      indexVariantRsId: variant.rsId,
      chromosome: variant.chromosome,
      position: variant.position,
      globalPosition: ch.cumulativeLength - ch.length + variant.position,
    };
  });
}

function significantLoci(data) {
  return hasAssociations(data)
    ? data.manhattan.associations.filter(d => d.pval < SIGNIFICANCE).length
    : 0;
}

function loci(data) {
  return hasAssociations(data) ? data.manhattan.associations.length : 0;
}

class ManhattanContainer extends React.Component {
  state = {
    associations: [],
    start: 0,
    end: maxPos,
  };

  manhattanPlot = React.createRef();

  handleZoom = (start, end) => {
    const { start: prevStart, end: prevEnd } = this.state;
    if (start !== prevStart || end !== prevEnd) {
      this.setState({ start, end });
    }
  };

  transformData = () => {
    const { data } = this.props;
    const isAssociatedStudy = hasAssociations(data);
    const associations = isAssociatedStudy ? transformAssociations(data) : [];
    this.setState({ associations });
  };

  componentDidMount() {
    this.transformData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { data } = this.props;
    if (data !== prevProps.data) {
      this.transformData();
    }
  }

  render() {
    const { data, loading, error, studyId } = this.props;
    const { associations, start, end } = this.state;

    const significantLociCount = significantLoci(data);
    const lociCount = loci(data);
    return (
      <React.Fragment>
        <SectionHeading
          heading="Independently-associated loci"
          subheading={
            !loading
              ? `Found ${significantLociCount} loci with genome-wide
              significance (p-value < 5e-8) out of ${lociCount}`
              : null
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
        <DownloadSVGPlot
          svgContainer={this.manhattanPlot}
          loading={loading}
          error={error}
          filenameStem={`${studyId}-independently-associated-loci`}
          reportDownloadEvent={() =>
            reportAnalyticsEvent({
              category: 'visualisation',
              action: 'download',
              label: `study:manhattan:svg`,
            })
          }
        >
          <Manhattan
            ref={this.manhattanPlot}
            associations={associations}
            tableColumns={tableColumns}
            studyId={studyId}
            onZoom={this.handleZoom}
            listTooltip={ListTooltip}
          />
        </DownloadSVGPlot>
        <ManhattanTable
          loading={loading}
          error={error}
          data={associations.filter(assoc => {
            return start <= assoc.globalPosition && assoc.globalPosition <= end;
          })}
          studyId={studyId}
          filenameStem={`${studyId}-independently-associated-loci`}
        />
      </React.Fragment>
    );
  }
}

export default ManhattanContainer;
