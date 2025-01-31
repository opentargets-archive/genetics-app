import React from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@apollo/client';

import BasePage from '../BasePage';
import ScrollToTop from '../../components/ScrollToTop';

import NotFoundPage from '../NotFoundPage';
import Header from './Header';
import Summary from '../../sections/variant/Summary';
import VARIANT_HEADER_QUERY from './VariantHeader.gql';
import { AssignedGenes } from './AssignedGenes';
import { GWASLeadVariants } from './GWASLeadVariants';
import { TagVariantPage } from './TagVariantPage';
import PheWASSection from '../../sections/variant/PheWASSection';

function VariantPage(props) {
  const { history } = props;

  const { match } = props;
  const { variantId } = match.params;
  const { loading, data: headerData } = useQuery(VARIANT_HEADER_QUERY, {
    variables: { variantId },
  });

  if (headerData && !headerData.variantInfo) {
    return <NotFoundPage />;
  }
  return (
    <BasePage>
      <ScrollToTop />
      <Helmet>
        <title>{variantId}</title>
      </Helmet>
      <Header loading={loading} data={headerData} />
      <Summary variantId={variantId} />
      <AssignedGenes variantId={variantId} />
      <PheWASSection variantId={variantId} history={history} />
      <GWASLeadVariants variantId={variantId} />
      <TagVariantPage variantId={variantId} />
    </BasePage>
  );
}

export default VariantPage;
