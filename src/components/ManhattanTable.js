import React, { Fragment } from 'react';

import {
  Link,
  OtTableRF,
  DataDownloader,
  commaSeparate,
  significantFigures,
} from 'ot-ui';
import { getCytoband } from 'ot-charts';

import LocusLink from './LocusLink';
import StudyLocusLink from './StudyLocusLink';
import { pvalThreshold } from '../constants';
import variantIdComparator from '../logic/variantIdComparator';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';
import cytobandComparator from '../logic/cytobandComparator';

export const tableColumns = studyId => [
  {
    id: 'indexVariantId',
    label: 'Lead Variant',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
    comparator: variantIdComparator,
  },
  {
    id: 'indexVariantRsId',
    label: 'rsID',
  },
  {
    id: 'cytoband',
    label: 'Cytoband',
    comparator: cytobandComparator,
  },
  {
    id: 'pval',
    label: 'P-value',
    renderCell: rowData =>
      rowData.pval < pvalThreshold
        ? `<${pvalThreshold}`
        : significantFigures(rowData.pval),
  },
  {
    id: 'beta',
    label: 'Beta',
    tooltip: (
      <React.Fragment>
        Beta with respect to the ALT allele.
        <Link
          external
          tooltip
          to="https://genetics-docs.opentargets.org/faqs#why-are-betas-and-odds-ratios-displayed-inconsistently-in-the-portal"
        >
          See FAQ.
        </Link>
      </React.Fragment>
    ),
    renderCell: rowData =>
      rowData.beta ? significantFigures(rowData.beta) : null,
  },
  {
    id: 'oddsRatio',
    label: 'Odds Ratio',
    tooltip: 'Odds ratio with respect to the ALT allele',
    renderCell: rowData =>
      rowData.oddsRatio ? significantFigures(rowData.oddsRatio) : null,
  },
  {
    id: 'ci',
    label: '95% Confidence Interval',
    tooltip:
      '95% confidence interval for the effect estimate. CIs are calculated approximately using the reported p-value.',
    renderCell: rowData =>
      rowData.beta
        ? `(${significantFigures(rowData.betaCILower)}, ${significantFigures(
            rowData.betaCIUpper
          )})`
        : rowData.oddsRatio
          ? `(${significantFigures(
              rowData.oddsRatioCILower
            )}, ${significantFigures(rowData.oddsRatioCIUpper)})`
          : null,
  },
  {
    id: 'credibleSetSize',
    label: 'Credible Set Size',
    tooltip: 'Number of variants in 95% credible set at this locus',
    renderCell: rowData =>
      rowData.credibleSetSize ? commaSeparate(rowData.credibleSetSize) : null,
  },
  {
    id: 'ldSetSize',
    label: 'LD Set Size',
    tooltip:
      'Number of variants that are in LD (R2 >= 0.7) with this lead variant',
    renderCell: rowData =>
      rowData.ldSetSize ? commaSeparate(rowData.ldSetSize) : null,
  },
  {
    id: 'bestGenes',
    label: 'Top V2G Genes',
    tooltip:
      'The top ranked genes from our variant-to-gene pipeline for this lead variant',
    renderCell: rowData => (
      <React.Fragment>
        {rowData.bestGenes.map((d, i) => (
          <React.Fragment key={i}>
            <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>{' '}
          </React.Fragment>
        ))}
      </React.Fragment>
    ),
  },
  {
    id: 'bestColocGenes',
    label: 'Top Colocalising Genes',
    tooltip:
      'The list of genes which colocalise at this locus with PP(H4) > 0.95 and log2(H4/H3) > log2(5)',
    renderCell: rowData => (
      <React.Fragment>
        {rowData.bestColocGenes.map((d, i) => (
          <React.Fragment key={i}>
            <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>{' '}
          </React.Fragment>
        ))}
      </React.Fragment>
    ),
  },
  {
    id: 'locus',
    label: 'View',
    renderCell: rowData => (
      <LocusLink
        chromosome={rowData.chromosome}
        position={rowData.position}
        selectedIndexVariants={[rowData.indexVariantId]}
        selectedStudies={[studyId]}
      />
    ),
  },
  {
    id: 'studyLocus',
    label: 'View',
    renderCell: rowData => (
      <StudyLocusLink
        indexVariantId={rowData.indexVariantId}
        studyId={studyId}
      />
    ),
  },
];

const getDownloadColumns = columns => {
  return columns.slice(0, columns.length - 1);
};

const getDownloadData = dataWithCytoband => {
  return dataWithCytoband.map(row => {
    return {
      indexVariantId: row.indexVariantId,
      indexVariantRsId: row.indexVariantRsId,
      cytoband: row.cytoband,
      pval: row.pval,
      beta: row.beta,
      oddsRatio: row.oddsRatio,
      ci: row.beta
        ? `(${significantFigures(row.betaCILower)}, ${significantFigures(
            row.betaCIUpper
          )})`
        : row.oddsRatio
          ? `(${significantFigures(row.oddsRatioCILower)}, ${significantFigures(
              row.oddsRatioCIUpper
            )})`
          : null,
      credibleSetSize: row.credibleSetSize,
      ldSetSize: row.ldSetSize,
      bestGenes: row.bestGenes.map(d => d.gene.symbol).join(', '),
    };
  });
};

function ManhattanTable({ loading, error, data, studyId, filenameStem }) {
  const dataWithCytoband = data.map(d => {
    const { chromosome, position } = d;
    return {
      ...d,
      cytoband: getCytoband(chromosome, position),
    };
  });
  const columns = tableColumns(studyId);
  const downloadColumns = getDownloadColumns(columns);
  const downloadData = getDownloadData(dataWithCytoband);

  return (
    <Fragment>
      <DataDownloader
        tableHeaders={downloadColumns}
        rows={downloadData}
        fileStem={filenameStem}
      />
      <OtTableRF
        loading={loading}
        error={error}
        columns={columns}
        data={dataWithCytoband}
        sortBy="pval"
        order="asc"
        reportTableDownloadEvent={format => {
          reportAnalyticsEvent({
            category: 'table',
            action: 'download',
            label: `study:manhattan:${format}`,
          });
        }}
        reportTableSortEvent={(sortBy, order) => {
          reportAnalyticsEvent({
            category: 'table',
            action: 'sort-column',
            label: `study:manhattan:${sortBy}(${order})`,
          });
        }}
      />
    </Fragment>
  );
}

export default ManhattanTable;
