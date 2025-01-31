import React, { useState } from 'react';

import { useQuery } from '@apollo/client';
import { ascending } from 'd3';
import { Skeleton } from '@material-ui/lab';
import {
  Tab,
  Tabs,
  DataDownloader,
  SectionHeading,
  significantFigures,
} from '../../../ot-ui-components';
import { traitAuthorYear, getPhenotypeId } from '../../../utils';
import Link from '../../../components/Link';
import ColocQTLTable from '../../../components/ColocQTLTable';
import ColocQTLGeneTissueTable from '../../../components/ColocQTLGeneTissueTable';

import STUDY_LOCUS_GENE_PRIORITISATION from './GenePrioritisationTabs.gql';

const tableColumns = [
  {
    id: 'gene.symbol',
    label: 'Gene',
    comparator: (a, b) => ascending(a.gene.symbol, b.gene.symbol),
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  },
  {
    id: 'phenotypeId',
    label: 'Molecular trait'
  },
  {
    id: 'tissue.name',
    label: 'Tissue',
    comparator: (a, b) => ascending(a.tissue.name, b.tissue.name),
    renderCell: d => d.tissue.name,
  },
  {
    id: 'qtlStudyName',
    label: 'Source',
  },
  {
    id: 'indexVariant',
    label: 'Lead variant',
    comparator: (a, b) => ascending(a.indexVariant.id, b.indexVariant.id),
    renderCell: d => (
      <Link to={`/variant/${d.indexVariant.id}`}>{d.indexVariant.id}</Link>
    ),
  },
  {
    id: 'beta',
    label: 'QTL beta',
    tooltip:
      'QTL effect with respect to the alternative allele of the page variant',
    renderCell: d => significantFigures(d.beta),
  },
  {
    id: 'h3',
    label: 'H3',
    tooltip: (
      <>
        Posterior probability that the signals <strong>do not</strong>{' '}
        colocalise
      </>
    ),
    renderCell: d => significantFigures(d.h3),
  },
  {
    id: 'h4',
    label: 'H4',
    tooltip: 'Posterior probability that the signals colocalise',
    renderCell: d => significantFigures(d.h4),
  },
  {
    id: 'log2h4h3',
    label: 'log2(H4/H3)',
    tooltip: 'Log-likelihood that the signals colocalise',
    renderCell: d => significantFigures(d.log2h4h3),
  },
];

const getDownloadData = data => {
  return data.map(d => ({
    'gene.symbol': d.gene.symbol,
    phenotypeId: getPhenotypeId(d.phenotypeId),
    'tissue.name': d.tissue.name,
    qtlStudyName: d.qtlStudyName,
    indexVariant: d.indexVariant.id,
    beta: d.beta,
    h3: d.h3,
    h4: d.h4,
    log2h4h3: d.log2h4h3,
  }));
};

const GenePrioritisationTabs = ({ variantId, studyId }) => {
  let [qtlTabsValue, setQtlTabsValue] = useState('heatmap');
  let studyInfo, qtlColocDownloadData, qtlColocalisation;

  const handleQtlTabsChange = (event, qtlTabsValue) => {
    setQtlTabsValue(qtlTabsValue);
  };

  const { loading, error, data: queryResult } = useQuery(
    STUDY_LOCUS_GENE_PRIORITISATION, {variables: { studyId, variantId }}
  );

  if(queryResult) {
    qtlColocDownloadData = getDownloadData(queryResult.qtlColocalisation);
    qtlColocalisation = queryResult.qtlColocalisation;
    studyInfo = queryResult.studyInfo;
  }

  return (
    <>
      <SectionHeading
        heading={
          <div id="coloc">
            Gene prioritisation using colocalisation analysis
          </div>
        }
        subheading={
          <>
            Which molecular traits colocalise with{' '}
            <strong>{studyInfo ? traitAuthorYear(studyInfo) : ''}</strong> at
            this locus?
          </>
        }
      />
      <DataDownloader
        loading={loading}
        tableHeaders={tableColumns}
        rows={qtlColocDownloadData}
        fileStem={`qtl-coloc-${studyId}-${variantId}`}
      />
      <Tabs
        variant="scrollable"
        value={qtlTabsValue}
        onChange={handleQtlTabsChange}
      >
        <Tab label="Heatmap" value="heatmap" />
        <Tab label="Table" value="table" />
      </Tabs>
      {loading ? (
        <Skeleton width="85vw" height="40vh" />
      ) : null}
      {qtlTabsValue === 'heatmap' && !loading ? (
        <ColocQTLGeneTissueTable
          loading={loading}
          error={error}
          data={qtlColocalisation}
          fileStem="qtl-coloc-heatmap"
        />
      ) : null}
      {qtlTabsValue === 'table' && !loading ? (
        <ColocQTLTable
          loading={loading}
          error={error}
          data={qtlColocalisation}
          tableColumns={tableColumns}
        />
      ) : null}
    </>
  );
};

export default GenePrioritisationTabs;
