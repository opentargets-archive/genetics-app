import React from 'react';

import { Typography } from '@material-ui/core';
import Link from '../../../components/Link';

function APIHeader() {
  return (
    <>
    {/* TODO: update static content and link */}
      <Typography variant="h4" paragraph>
        API
      </Typography>
      <Typography paragraph>
        The Open Targets Genetics is powered by a GraphQL API. Read our{' '}
        <Link
          external
          to="https://genetics-docs.opentargets.org/data-access/graphql-api"
        >
          GraphQL API documentation
        </Link>{' '}
        and visit the{' '}
        <Link external to="https://community.opentargets.org">
          Open Targets Community
        </Link>{' '}
        for more how-to guides and tutorials.
      </Typography>
      <Typography paragraph>
        Please note that our API is optimised for a single query. For more
        programmatic or systematic analyses, please use{' '}
        <Link
          external
          to="https://genetics-docs.opentargets.org/data-access/data-download"
        >
          our dataset downloads
        </Link>
        .
      </Typography>
    </>
  );
}

export default APIHeader;
