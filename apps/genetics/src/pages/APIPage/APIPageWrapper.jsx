import { Suspense, lazy } from 'react';
import { LoadingBackdrop } from 'ui';
import BasePage from '../BasePage';

const APIPage = lazy(() => import('./APIPage.jsx'));

function APIPageWrapper() {
  return (
    <BasePage title="API" description="API">
      <Suspense fallback={<LoadingBackdrop />}>
        <APIPage />
      </Suspense>
    </BasePage>
  );
}

export default APIPageWrapper;
