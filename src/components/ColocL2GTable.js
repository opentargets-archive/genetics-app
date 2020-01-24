import React from 'react';
import * as d3 from 'd3';

import { Link, OtTableRF, DataDownloader, significantFigures } from 'ot-ui';

import StudyLocusLink from './StudyLocusLink';

const tableColumns = [
  {
    id: 'gene.symbol',
    label: 'Gene',
    comparator: (a, b) => d3.ascending(a.gene.symbol, b.gene.symbol),
    renderCell: d => <Link to={`/gene/${d.gene.symbol}`}>{d.gene.symbol}</Link>,
  },
  {
    id: 'yProbaModel',
    label: 'Overall L2G score',
    comparator: (a, b) => d3.ascending(a.yProbaModel, b.yProbaModel),
    renderCell: d => d.yProbaModel,
  },
  {
    id: 'yProbaPathogenicity',
    label: 'Variant Pathogenicity',
    comparator: (a, b) =>
      d3.ascending(a.yProbaPathogenicity, b.yProbaPathogenicity),
    renderCell: d => d.yProbaPathogenicity,
  },
  {
    id: 'yProbaDistance',
    label: 'Distance',
    comparator: (a, b) => d3.ascending(a.yProbaDistance, b.yProbaDistance),
    renderCell: d => (
      <Link to={`/variant/${d.yProbaDistance}`}>{d.yProbaDistance}</Link>
    ),
  },
  {
    id: 'yProbaInterlocus',
    label: 'QTL Coloc',
    tooltip:
      'Effect with respect to the alternative allele of the page variant',
    renderCell: d => significantFigures(d.yProbaInterlocus),
  },
  {
    id: 'yProbaInteraction',
    label: 'Chromatin Interaction',
    tooltip: (
      <React.Fragment>
        Posterior probability that the signals <strong>do not</strong>{' '}
        colocalise
      </React.Fragment>
    ),
    renderCell: d => significantFigures(d.yProbaInteraction),
  },
  {
    id: 'yProbaDistance',
    label: 'Distance to Locus ',
    tooltip: 'Posterior probability that the signals colocalise',
    renderCell: d => significantFigures(d.yProbaDistance),
  },
  {
    id: 'hasColoc',
    label: 'Evidence of colocalisation',
    tooltip: 'Log-likelihood that the signals colocalise',
    renderCell: d => (d.hasColoc ? 'yes' : 'no'),
  },
  {
    id: 'locus',
    label: 'View other evidence linking study-locus-gene',
    renderCell: d => <Link>click</Link>,
  },
];

const getDownloadData = data => {
  return data.map(d => ({
    study: d.study.studyId,
    traitReported: d.study.traitReported,
    pubAuthor: d.study.pubAuthor,
    indexVariant: d.indexVariant.id,
    beta: d.beta,
    h3: d.h3,
    h4: d.h4,
    log2h4h3: d.log2h4h3,
  }));
};

const ColocL2GTable = ({ loading, error, fileStem, data }) => {
  console.log(data);
  const downloadData = []; // getDownloadData(data);
  return (
    <React.Fragment>
      <DataDownloader
        tableHeaders={tableColumns}
        rows={downloadData}
        fileStem={fileStem}
      />
      <OtTableRF
        loading={loading}
        error={error}
        columns={tableColumns}
        data={data}
        headerGroups={[
          { colspan: 2, label: '' },
          {
            colspan: 4,
            label: 'Partial L2G scores',
          },
          { colspan: 3, label: '' },
        ]}
      />
    </React.Fragment>
  );
};

export default ColocL2GTable;
