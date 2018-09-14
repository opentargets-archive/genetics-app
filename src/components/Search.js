import React from 'react';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import { Search as OtSearch, SearchOption, commaSeparate } from 'ot-ui';

const SEARCH_QUERY = gql`
  query SearchQuery($queryString: String) {
    search(queryString: $queryString) {
      totalGenes
      totalVariants
      totalStudies
      genes {
        id
        symbol
        chromosome
        start
        end
      }
      variants {
        variant {
          id
          rsId
          chromosome
          position
          refAllele
          altAllele
        }
        relatedGenes
      }
      studies {
        studyId
        traitReported
        pmid
        pubAuthor
        pubDate
        pubJournal
      }
    }
  }
`;

const asGroupedOptions = data => {
  return [
    {
      label: 'Genes',
      options: data.genes.map(d => ({ ...d, groupType: 'gene' })),
    },
    {
      label: 'Variants',
      options: data.variants.map(d => ({ ...d, groupType: 'variant' })),
    },
    {
      label: 'Studies',
      options: data.studies.map(d => ({ ...d, groupType: 'study' })),
    },
  ];
};

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
      return (
        <SearchOption
          heading={data.variant.id}
          subheading={data.variant.rsId}
          extra={
            data.relatedGenes.length > 0
              ? `Linked genes: ${data.relatedGenes.join(', ')}`
              : null
          }
        />
      );
    case 'study':
      const pubYear = new Date(data.pubDate).getFullYear();
      return (
        <SearchOption
          heading={data.traitReported}
          subheading={`${data.pubAuthor} (${pubYear})`}
          extra={data.pubJournal}
        />
      );
    default:
      throw Error('Unexpected groupType. Should be gene, variant or study.');
  }
};

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }
  handleSelectOption = (value, { action }) => {
    const { history } = this.props;
    if (action === 'select-option') {
      switch (value.groupType) {
        case 'gene':
          history.push(`/gene/${value.id}`);
          break;
        case 'variant':
          history.push(`/variant/${value.variant.id}`);
          break;
        case 'study':
          history.push(`/study/${value.studyId}`);
          break;
        default:
          break;
      }
    }
  };
  handleInputChange = inputValue => {
    if (!inputValue || inputValue.length < 3) {
      return;
    }

    const { client } = this.props;
    return client
      .query({
        query: SEARCH_QUERY,
        variables: { queryString: inputValue },
      })
      .then(response => {
        if (response.data && response.data.search) {
          return asGroupedOptions(response.data.search);
        } else {
          return asGroupedOptions({
            genes: [],
            variants: [],
            studies: [],
          });
        }
      });
  };
  render() {
    return (
      <OtSearch
        onInputChange={this.handleInputChange}
        optionComponent={Option}
        value={this.state.value}
        onSelectOption={this.handleSelectOption}
        placeholder="Search for a gene, variant or trait..."
      />
    );
  }
}

export default withApollo(withRouter(Search));
