import React from 'react';
import { SearchOption, commaSeparate } from 'ot-ui';

const Option = ({ data }) => {
  switch (data.groupType) {
    case 'gene':
      return (
        <SearchOption
          heading={data.symbol}
          subheading={`${data.chromosome}:${commaSeparate(
            data.start
          )}-${commaSeparate(data.end)}`}
          extra={data.id}
        />
      );
    case 'variant':
      return <SearchOption heading={data.id} subheading={data.rsId} />;
    case 'study':
      const pubYear = new Date(data.pubDate).getFullYear();
      return (
        <SearchOption
          heading={data.traitReported}
          subheading={`${data.pubAuthor} (${pubYear})`}
          extra={
            <React.Fragment>
              {data.pubJournal ? <em>{data.pubJournal} </em> : null}N Study:{' '}
              {commaSeparate(data.nInitial)}
            </React.Fragment>
          }
        />
      );
    case 'study-overlap':
      return (
        <SearchOption
          heading={data.traitReported}
          subheading={`${data.pubAuthor} (${new Date(
            data.pubDate
          ).getFullYear()})`}
          extra={data.pubJournal}
          count={`${data.overlappingLociCount} overlapping loci`}
          proportion={data.rootOverlapProportion}
        />
      );
    default:
      throw Error('Unexpected groupType. Should be gene, variant or study.');
  }
};

export default Option;
