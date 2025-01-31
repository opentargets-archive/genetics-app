import { React, useState, Suspense, lazy } from 'react';

import { Grid, makeStyles } from '@material-ui/core';
import 'graphiql/graphiql.min.css';
import APIHeader from '../../sections/api-page/Header/APIHeader';
import SampleQueries from '../../sections/api-page/SampleQueries';

import { LoadingBackdrop } from 'ui';

// lazy load GraphiQL and remove Logo and Toolbar
const GraphiQL = lazy(() =>
  import('graphiql').then(module => {
    module.default.Logo = () => null;
    module.default.Toolbar = () => null;
    return module;
  })
);

const useStyles = makeStyles({
  container: {
    minHeight: '600px',
  },
});

import config from '../../config';
// TODO: move to util file
async function fetcher(graphQLParams) {
  const data = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(graphQLParams),
  });
  return data.json();
}

function APIPage() {
  const classes = useStyles();
  const [query, setQuery] = useState('');

  return (
    <>
      <APIHeader />
      <Grid className={classes.container} container spacing={3}>
        <Grid item md={3} xl={2}>
          <SampleQueries setQuery={setQuery} />
        </Grid>
        <Grid item md={9} xl={10}>
          <Suspense fallback={<LoadingBackdrop />}>
            <GraphiQL fetcher={fetcher} query={query} />
          </Suspense>
        </Grid>
      </Grid>
    </>
  );
}

export default APIPage;
