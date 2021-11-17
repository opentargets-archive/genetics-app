import React from 'react';

import {
  Link,
  OtTableRF,
  DataDownloader,
  significantFigures,
} from '../ot-ui-components';

const tableColumns = [
  {
    id: 'id',
    label: 'Variant',
    renderCell: d => <Link to={`/variant/${d.id}`}>{d.id}</Link>,
  },
  // {
  //   id: 'rsId',
  //   label: 'Variant rsID',
  // },
  {
    id: 'position',
    label: 'Position',
  },
  {
    id: 'posteriorProbabilityMax',
    label: 'Maximum Posterior Probability',
    tooltip:
      'The maximum posterior probability for this variant across selected colocalisation tracks',
    renderCell: d => significantFigures(d.posteriorProbabilityMax),
  },
  {
    id: 'posteriorProbabilityProd',
    label: 'Product of Posterior Probabilities (across selected studies)',
    tooltip:
      'The product of posterior probabilities for this variant across selected colocalisation tracks',
    renderCell: d => significantFigures(d.posteriorProbabilityProd),
  },
];

const getDownloadData = data => {
  return data.map(d => ({
    id: d.id,
    position: d.position,
    posteriorProbabilityMax: d.posteriorProbabilityMax,
    posteriorProbabilityProd: d.posteriorProbabilityProd,
  }));
};

const CredibleSetsIntersectionTable = ({ filenameStem, data }) => {
  const downloadData = getDownloadData(data);
  return (
    <React.Fragment>
      <DataDownloader
        tableHeaders={tableColumns}
        rows={downloadData}
        fileStem={filenameStem}
      />
      <OtTableRF
        loading={false}
        error={false}
        columns={tableColumns}
        data={data}
        sortBy="posteriorProbabilityProd"
        order="desc"
      />
    </React.Fragment>
  );
};

export default CredibleSetsIntersectionTable;
