import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  Box,
  CircularProgress,
  Input,
  InputBase,
  makeStyles,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Search as SearchIcon, ArrowDropDown } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

import useDebounce from '../../hooks/useDebounce';
import Option from './Option';
import Group from './Group';

import SEARCH_QUERY from './SearchQuery.gql';
const EntitiesMap = {
  genes: 'gene',
  studies: 'study',
  variants: 'variant',
};

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
  },
  containerEmbedded: {
    minWidth: '447px',
    [theme.breakpoints.only('sm')]: { minWidth: '48%' },
    [theme.breakpoints.only('xs')]: { display: 'none' },
  },
  input: {
    width: '100%',
    paddingRight: '60px',
  },
  inputBase: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.secondary,
    width: '100%',
  },
  inputBaseInput: { padding: '.25rem .5rem' },
  listbox: { maxHeight: '275px', color: theme.palette.text.primary },
  option: { display: 'block', padding: '0 .5rem' },
  root: {
    width: '100%',
  },
}));

function Search({ autoFocus = false, embedded = false }) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = useState('');
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [getData, { loading, data }] = useLazyQuery(SEARCH_QUERY, {
    variables: { queryString: debouncedInputValue },
    onCompleted: () => {},
  });
  const [searchResults, setSearchResults] = useState([]);
  let history = useHistory();

  const handleChangeInputValue = (e) => {
    if (!e.target.value) {
      setOpen(false);
    } else {
      setOpen(true);
    }
    setInputValue(e.target.value || '');
  };

  const handleSelectOption = (e, option) => {
    handleChangeInputValue(e);

    if (!option) return;

    if (option.entity === 'study') {
      history.push(`/${option.entity}/${option.studyId}`);
    } else {
      history.push(`/${option.entity}/${option.id}`);
    }
  };

  useEffect(() => {
    if (debouncedInputValue) {
      getData({ variables: { queryString: debouncedInputValue } });
    } else {
      setSearchResults([]);
    }
  }, [debouncedInputValue, getData]);

  useEffect(() => {
    const res = [];

    if (data) {
      ['variants', 'genes', 'studies'].forEach((key) =>
        data.search[key].map((element) =>
          res.push({
            type: key === 'topHit' ? 'topHit' : 'normal',
            entity: EntitiesMap[key],
            ...element,
          })
        )
      );
    }
    setSearchResults(res);
  }, [data, inputValue]);

  const classes = useStyles();

  return (
    <Box className={!embedded ? classes.container : classes.containerEmbedded}>
      <Autocomplete
        autoHighlight
        freeSolo
        forcePopupIcon
        disablePortal
        clearOnEscape={false}
        classes={{
          listbox: classes.listbox,
          option: classes.option,
          root: classes.root,
        }}
        filterOptions={(o, s) => searchResults}
        getOptionLabel={(option) => (option.id ? option.id : option)}
        getOptionSelected={(option, value) => option.id === value}
        groupBy={(option) =>
          option.type === 'topHit' ? 'topHit' : option.entity
        }
        loading={loading}
        noOptionsText="No results"
        options={searchResults}
        onChange={handleSelectOption}
        onOpen={() => {
          if (inputValue) setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
        popupIcon={open ? <ArrowDropDown /> : <SearchIcon />}
        renderOption={(option) => <Option data={option} />}
        renderGroup={(group) => (
          <Group key={group.key} name={group.group} children={group.children} />
        )}
        renderInput={(params) =>
          !embedded ? (
            <Input
              className={classes.input}
              inputProps={params.inputProps}
              ref={params.InputProps.ref}
              endAdornment={
                loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : (
                  params.InputProps.endAdornment
                )
              }
              placeholder="Search for a gene, variant, study, or trait..."
              onChange={handleChangeInputValue}
              value={inputValue}
            />
          ) : (
            <InputBase
              autoFocus={autoFocus}
              classes={{
                root: classes.inputBase,
                input: classes.inputBaseInput,
              }}
              inputProps={params.inputProps}
              ref={params.InputProps.ref}
              endAdornment={
                loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : (
                  params.InputProps.endAdornment
                )
              }
              placeholder="Search..."
              onChange={handleChangeInputValue}
              value={inputValue}
            />
          )
        }
        value={inputValue}
      />
    </Box>
  );
}

export default Search;
