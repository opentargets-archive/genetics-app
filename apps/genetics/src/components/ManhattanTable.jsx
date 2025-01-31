import React, { Fragment } from 'react';

import {
  Link,
  OtTableRF,
  DataDownloader,
  commaSeparate,
  significantFigures,
} from '../ot-ui-components';

import StudyLocusLink from './StudyLocusLink';
import { pvalThreshold } from '../constants';
import variantIdComparator from '../logic/variantIdComparator';
import { getCytoband } from '../utils';

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
    id: 'bestLocus2Genes',
    label: 'L2G',
    tooltip: 'Genes prioritised by our locus-to-gene model with score ≥ 0.5',
    renderCell: rowData => (
      <React.Fragment>
        {rowData.bestLocus2Genes.map((d, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ', ' : ''}
            <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>
          </React.Fragment>
        ))}
      </React.Fragment>
    ),
  },
  {
    id: 'nearestCodingGene',
    label: 'Closest Gene',
    tooltip: 'The gene with the closest transcription start site',
    renderCell: rowData =>
      rowData.nearestCodingGene ? (
        <Link to={`/gene/${rowData.nearestCodingGene.id}`}>
          {rowData.nearestCodingGene.symbol}
        </Link>
      ) : null,
  },
  {
    id: 'bestColocGenes',
    label: 'Colocalisation',
    tooltip:
      'The list of genes which colocalise at this locus with PP(H4) ≥ 0.95 and log2(H4/H3) ≥ log2(5)',
    renderCell: rowData => (
      <React.Fragment>
        {rowData.bestColocGenes.map((d, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ', ' : ''}
            <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>
          </React.Fragment>
        ))}
      </React.Fragment>
    ),
  },
  {
    id: 'locus',
    label: 'View',
    renderCell: rowData => (
      <React.Fragment>
        <StudyLocusLink
          indexVariantId={rowData.indexVariantId}
          studyId={studyId}
        />
      </React.Fragment>
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
      bestLocus2Genes: row.bestLocus2Genes.map(d => d.gene.symbol).join(', '),
      nearestCodingGene: row.nearestCodingGene
        ? row.nearestCodingGene.symbol
        : '',
      bestColocGenes: row.bestColocGenes.map(d => d.gene.symbol).join(', '),
    };
  });
};

function ManhattanTable({
  loading,
  error,
  data,
  studyId,
  hasSumstats,
  filenameStem,
}) {
  const dataWithCytoband = data.map(d => {
    const { chromosome, position } = d;
    return {
      ...d,
      cytoband: getCytoband(chromosome, position),
    };
  });
  const columns = tableColumns(studyId, hasSumstats);
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
        headerGroups={[
          { colspan: 7, label: 'Association Information' },
          {
            colspan: 5,
            label: (
              <Fragment>
                Prioritised Genes
                <br />
                <small>results from our gene prioritisation pipelines</small>
              </Fragment>
            ),
          },
        ]}
      />
    </Fragment>
  );
}

export default ManhattanTable;
