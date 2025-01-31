import React from 'react';
import { Typography } from '@material-ui/core';

import BasePage from '../BasePage';
import { EmptyPage } from 'ui';

const NotFoundPage = () => {
  return (
    <BasePage>
      <EmptyPage>
        <Typography>This page could not be found.</Typography>
      </EmptyPage>
    </BasePage>
  );
};

export default NotFoundPage;
