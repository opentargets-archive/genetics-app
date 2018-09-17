import React from 'react';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import { Search as OtSearch, SearchOption } from 'ot-ui';

const SEARCH_QUERY = gql`
  query SearchQuery($queryString: String) {
    search(queryString: $queryString) {
      totalStudies
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
      label: 'Studies',
      options: data.studies.map(d => ({ ...d, groupType: 'study' })),
    },
  ];
};

const Option = ({ data }) => {
  switch (data.groupType) {
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
      throw Error('Unexpected groupType. Should be study.');
  }
};

class StudySearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }
  handleSelectOption = (value, { action }) => {
    const { handleAddStudy } = this.props;
    handleAddStudy(value.studyId);
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
        placeholder="Search for a trait or author..."
      />
    );
  }
}

export default withApollo(withRouter(StudySearch));
