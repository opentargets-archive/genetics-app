import React from 'react';
import { useQuery } from '@apollo/client';

import Header from './Header';
import BasePage from '../BasePage';

import ScrollToTop from '../../components/ScrollToTop';
import ErrorBoundary from '../../components/ErrorBoundary';

import StudyLocusGenes from '../../sections/studyLocus/Genes/StudyLocusGenes';
import CredibleSetsGroup from '../../sections/studyLocus/CredibleSetsGroup';
import ColocGWASTable from '../../sections/studyLocus/ColocGWASTable';
import GenePrioritisationTabs from '../../sections/studyLocus/GenePrioritisationTabs';
import ColocL2GTable from '../../sections/studyLocus/ColocL2GTable';
import Summary from '../../sections/studyLocus/Summary';

import STUDY_LOCUS_HEADER_QUERY from './StudyLocusHeaderQuery.gql';

const HALF_WINDOW = 250000;

function StudyLocusPage({ match }) {
  const { studyId, indexVariantId } = match.params;

  const [chromosome, positionStr] = indexVariantId.split('_');
  const position = parseInt(positionStr);
  const start = position - HALF_WINDOW;
  const end = position + HALF_WINDOW;

  const { loading, data: dataHeader } = useQuery(STUDY_LOCUS_HEADER_QUERY, {
    variables: { studyId, variantId: indexVariantId },
  });

  return (
    <BasePage>
      {/* TODO: rescue Page title
        <Helmet>
          <title>{this.state.pageHeader}</title>
        </Helmet> */}
      <ScrollToTop />
      <ErrorBoundary>
        <Header loading={loading} data={dataHeader} />
        <Summary variantId={indexVariantId} studyId={studyId} />
        <ColocL2GTable variantId={indexVariantId} studyId={studyId} />
        <GenePrioritisationTabs variantId={indexVariantId} studyId={studyId} />
        <ColocGWASTable variantId={indexVariantId} studyId={studyId} />
        <CredibleSetsGroup
          variantId={indexVariantId}
          studyId={studyId}
          start={start}
          end={end}
          chromosome={chromosome}
        />
        <StudyLocusGenes chromosome={chromosome} start={start} end={end} />
      </ErrorBoundary>
    </BasePage>
  );
}

export default StudyLocusPage;
