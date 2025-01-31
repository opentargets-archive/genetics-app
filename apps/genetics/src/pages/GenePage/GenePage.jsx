import React from 'react';
import queryString from 'query-string';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';

import BasePage from '../BasePage';
import Header from './Header';

import L2GPipeline from '../../sections/gene/L2GPipeline/L2GPipeline';
import ColocAnalysis from '../../sections/gene/ColocAnalysis/ColocAnalysis';

const styles = theme => {
  return {
    section: {
      height: '100%',
      padding: theme.sectionPadding,
    },
    geneSymbol: {
      display: 'inline-block',
    },
    locusLinkButton: {
      width: '248px',
      height: '60px',
    },
    locusIcon: {
      fill: 'white',
      width: '40px',
      height: '40px',
    },
    link: {
      textDecoration: 'none',
    },
    geneInfoItem: {
      width: '20%',
    },
    platformLink: {
      textAlign: 'center',
      textDecoration: 'none',
      color: '#5A5F5F',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    iconLink: {
      '&:hover': {
        fill: theme.palette.primary.dark,
      },
    },
  };
};

function GenePage({ history, match }) {
  const { geneId } = match.params;

  const handleColocTraitFilter = newColocTraitFilterValue => {
    const { colocTraitFilter, ...rest } = _parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (newColocTraitFilterValue && newColocTraitFilterValue.length > 0) {
      newQueryParams.colocTraitFilter = newColocTraitFilterValue.map(
        d => d.value
      );
    }
    _stringifyQueryProps(newQueryParams);
  };
  const handleTraitFilter = newTraitFilterValue => {
    const { traitFilter, ...rest } = _parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (newTraitFilterValue && newTraitFilterValue.length > 0) {
      newQueryParams.traitFilter = newTraitFilterValue.map(d => d.value);
    }
    _stringifyQueryProps(newQueryParams);
  };
  const handleAuthorFilter = newFilterValue => {
    const { authorFilter, ...rest } = _parseQueryProps();
    const newQueryParams = {
      ...rest,
    };
    if (newFilterValue && newFilterValue.length > 0) {
      newQueryParams.authorFilter = newFilterValue.map(d => d.value);
    }
    _stringifyQueryProps(newQueryParams);
  };
  const _parseQueryProps = () => {
    const queryProps = queryString.parse(history.location.search);

    // single values need to be put in lists
    if (queryProps.colocTraitFilter) {
      queryProps.colocTraitFilter = Array.isArray(queryProps.colocTraitFilter)
        ? queryProps.colocTraitFilter
        : [queryProps.colocTraitFilter];
    }
    if (queryProps.traitFilter) {
      queryProps.traitFilter = Array.isArray(queryProps.traitFilter)
        ? queryProps.traitFilter
        : [queryProps.traitFilter];
    }
    if (queryProps.authorFilter) {
      queryProps.authorFilter = Array.isArray(queryProps.authorFilter)
        ? queryProps.authorFilter
        : [queryProps.authorFilter];
    }
    return queryProps;
  };
  const _stringifyQueryProps = newQueryParams => {
    history.replace({
      ...history.location,
      search: queryString.stringify(newQueryParams),
    });
  };

  const {
    colocTraitFilter: colocTraitFilterUrl,
    traitFilter: traitFilterUrl,
    authorFilter: authorFilterUrl,
  } = _parseQueryProps();

  return (
    <BasePage>
      <Header geneId={geneId} />
      <L2GPipeline
        geneId={geneId}
        traitFilterUrl={traitFilterUrl}
        authorFilterUrl={authorFilterUrl}
        handleTraitFilter={handleTraitFilter}
        handleAuthorFilter={handleAuthorFilter}
      />
      <ColocAnalysis
        geneId={geneId}
        handleColocTraitFilter={handleColocTraitFilter}
        colocTraitFilterUrl={colocTraitFilterUrl}
      />
    </BasePage>
  );
}

export default withStyles(styles)(GenePage);
