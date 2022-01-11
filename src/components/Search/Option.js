import React from 'react';
import { Typography, Chip } from '@material-ui/core';
import { commaSeparate } from '../../ot-ui-components';
import SearchOption from './BaseSearchOption';

const Search = ({ data }) => <Typography>Search for: {data.name}</Typography>;

const Gene = ({ data }) => (
  <SearchOption
    heading={data.symbol}
    subheading={`${data.chromosome}:${commaSeparate(
      data.start
    )}-${commaSeparate(data.end)}`}
    extra={data.id}
  />
);

const Study = ({ data }) => {
  const pubYear = new Date(data.pubDate).getFullYear();
  return (
    <SearchOption
      heading={data.traitReported}
      subheading={`${data.pubAuthor} (${pubYear})`}
      extra={
        <React.Fragment>
          {data.pubJournal ? <em>{data.pubJournal} </em> : null}N Study:{' '}
          {commaSeparate(data.nInitial)}
          <span style={{ float: 'right' }}>
            {data.hasSumstats ? (
              <Chip
                style={{
                  height: '16px',
                  fontSize: '0.7rem',
                  marginRight: '16px',
                }}
                color="primary"
                label="summary statistics"
              />
            ) : null}
            {data.numAssocLoci ? (
              <span
                style={{
                  minWidth: '100px',
                  display: 'inline-block',
                  textAlign: 'right',
                }}
              >
                <strong>{data.numAssocLoci} associated loci</strong>
              </span>
            ) : null}
          </span>
        </React.Fragment>
      }
    />
  );
};

const Variant = ({ data }) => (
  <SearchOption heading={data.id} subheading={data.rsId} />
);

const optionTypes = {
  search: { any: Search },
  normal: { gene: Gene, study: Study, variant: Variant },
};

const Option = ({ data }) => {
  const OptionType = optionTypes[data.type][data.entity];
  return <OptionType data={data} />;
};

export default Option;
