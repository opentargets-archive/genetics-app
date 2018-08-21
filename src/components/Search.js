import React from 'react';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import { Search as OtSearch, SearchOption } from 'ot-ui';

const SEARCH_QUERY = gql`
  query SearchQuery($queryString: String) {
    search(queryString: $queryString) {
      genes {
        id
        symbol
        name
        synonyms
      }
      variants {
        variantId
        rsId
      }
      studies {
        studyId
        traitReported
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
          subheading={data.name}
          extra={data.synonyms.join(', ')}
        />
      );
    case 'variant':
      return <SearchOption heading={data.variantId} subheading={data.rsId} />;
    case 'study':
      const pubYear = new Date(data.pubDate).getFullYear();
      return (
        <SearchOption
          heading={`${data.pubAuthor} (${pubYear})`}
          subheading={data.traitReported}
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
    this.handleSelectOption = this.handleSelectOption.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }
  handleSelectOption(value, { action }) {
    const { history } = this.props;
    if (action === 'select-option') {
      switch (value.groupType) {
        case 'gene':
          history.push(`/gene/${value.id}`);
          break;
        case 'variant':
          history.push(`/variant/${value.variantId}`);
          break;
        case 'study':
          history.push(`/study/${value.studyId}`);
          break;
        default:
          break;
      }
    }
    this.setState({
      value,
    });
  }
  handleInputChange(inputValue) {
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
  }
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
