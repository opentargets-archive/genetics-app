import { useState, useEffect, useContext, ChangeEvent } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchInput from "./Search/SearchInput";
import useSearchQueryData from "../hooks/useSearchQueryData";
import SearchListItem, { SearchResult } from "./Search/SearchListItem";
import SearchListHeader from "./Search/SearchListHeader";
import { makeStyles } from "@material-ui/core/styles";
import useListOption from "../hooks/useListOption";
import { SearchContext } from "./Search/SearchContext";
import SearchLoadingState from "./Search/SearchLoadingState";
import { containsObject } from "./Search/utils/searchUtils";

const useStyles = makeStyles((theme) => ({
  popper: {
    borderRadius: "0 0 12px 12px !important",
  },
  paper: {
    height: "inherit !important",
    boxShadow: "2px 0 4px -4px #999, -2px 0 4px -4px #999",
  },
  listbox: {
    maxHeight: "47vh !important",
  },
  option: {
    margin: "0 1rem",
    padding: "11px",
    border: "0.3px solid transparent",
    borderBottomWidth: "0.3px",
    borderStyle: "solid",
    borderImage: "linear-gradient(to right, white, #00000063, white)0 0 90",
    "&[data-focus='true']": {
      border: `0.3px solid ${theme.palette.primary}`,
      borderRadius: "4px",
      background: "#3489ca29",
    },
  },
}));

export default function AutocompleteSearch({
  closeModal = () => undefined,
  isHomePage,
  showSearchResultPage,
}: {
  closeModal?: () => void;
  isHomePage?: boolean;
  showSearchResultPage?: boolean;
}) {
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [openListItem] = useListOption();
  const [recentItems, setRecentValue] = useState(
    JSON.parse(localStorage.getItem("search-history") || "[]") || []
  );
  const [open, setOpen] = useState(isHomePage ? false : true);

  const classes = useStyles();

  const { searchQuery, setLoading, inputValue, setInputValue, loading } =
    useContext(SearchContext);

  const [getSearchData, { data, loading: searchQueryLoading }] =
    useSearchQueryData(searchQuery);

  const handleKeyPress = (event: KeyboardEvent): void => {
    // open on cmd + k
    if (event.metaKey === true && event.code === "KeyK") {
      event.stopPropagation();
      event.preventDefault();
      setOpen(true);
    }
  };

  useEffect(() => {
    setLoading(searchQueryLoading);
    if (searchQueryLoading) setSearchResult([]);
  }, [searchQueryLoading]);

  useEffect(() => {
    let searchForTermObject;
    setSearchResult(recentItems);
    setLoading(searchQueryLoading);
    if (inputValue && showSearchResultPage) {
      searchForTermObject = {
        symbol: "Search For: " + inputValue,
        name: inputValue,
        entity: "search",
        type: "",
      };
      setSearchResult([searchForTermObject, ...recentItems]);
    }
    if (!loading && inputValue && data.length) {
      const RESULT_DATA = JSON.parse(JSON.stringify(data));
      showSearchResultPage && RESULT_DATA.unshift(searchForTermObject);
      setSearchResult(RESULT_DATA);
      setLoading(false);
    }
  }, [data, inputValue, recentItems]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const searchQueryInput = (param: string) => {
    if (!param) {
      setSearchResult(recentItems);
    } else {
      setOpen(true);
      setInputValue(param);
      getSearchData(param);
    }
  };

  const onClose = () => {
    setLoading(false);
    setInputValue("");
    setOpen(false);
    closeModal();
  };

  const handleSelectOption = (
    event: ChangeEvent<object>,
    option: string | SearchResult | null
  ) => {
    if (typeof option === "object") {
      onClose();
      openListItem(option);
    }
  };

  const clearItem = (item: SearchResult) => {
    const removedItems = [...recentItems];
    const existingIndex = containsObject(item, removedItems);
    removedItems.splice(existingIndex, 1);
    setRecentValue(removedItems);
    localStorage.setItem("search-history", JSON.stringify(removedItems));
  };

  const clearAll = () => {
    setRecentValue([]);
    localStorage.removeItem("search-history");
  };

  return (
    <Autocomplete
      classes={{
        paper: classes.paper,
        popper: classes.popper,
        listbox: classes.listbox,
        option: classes.option,
      }}
      disablePortal
      openOnFocus
      autoHighlight
      clearOnEscape
      freeSolo
      options={searchResult}
      onChange={handleSelectOption}
      groupBy={(option) => option.type}
      loading={searchQueryLoading}
      loadingText={<SearchLoadingState />}
      renderGroup={(group) => (
        <SearchListHeader
          key={group.key}
          listHeader={group.group}
          children={group.children}
          clearAll={clearAll}
        />
      )}
      getOptionLabel={(option) => option.symbol || option.name || option.id}
      renderOption={(option) => (
        <SearchListItem
          item={option}
          isTopHit={option.type === "topHit"}
          clearItem={clearItem}
        />
      )}
      getOptionSelected={(option, value) => option.name === value.toString()}
      filterOptions={() => searchResult}
      renderInput={(params) => (
        <SearchInput
          params={params}
          debounceValue={searchQueryInput}
          onClose={onClose}
          isHomePage={isHomePage}
          focus={open}
          setOpen={setOpen}
        />
      )}
    />
  );
}
