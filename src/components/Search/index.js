import React from 'react';
import { withRouter } from 'react-router';
import { useApolloClient } from '@apollo/client';
import { loader } from 'graphql.macro';

import OtSearch from './Search';

import SearchOption from './SearchOption';

const SEARCH_QUERY = loader('../../queries/SearchQuery.gql');

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

const Search = ({ history, white = false }) => {
  const client = useApolloClient();
  const handleSelectOption = (value, { action }) => {
    if (action === 'select-option') {
      switch (value.groupType) {
        case 'gene':
          history.push(`/gene/${value.id}`);
          break;
        case 'variant':
          history.push(`/variant/${value.id}`);
          break;
        case 'study':
          history.push(`/study/${value.studyId}`);
          break;
        default:
          break;
      }
    }
  };
  const handleInputChange = inputValue => {
    if (!inputValue || inputValue.length < 3) {
      return;
    }
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

  return (
    <OtSearch
      onInputChange={handleInputChange}
      optionComponent={SearchOption}
      onSelectOption={handleSelectOption}
      placeholder="Search for a gene, variant, study, or trait..."
      white={white}
    />
  );
};

export default withRouter(Search);
