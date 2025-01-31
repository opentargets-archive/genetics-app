import { format } from "d3-format";
import { SearchResult } from "../SearchListItem";

export const formatSearchData = (unformattedData) => {
  const allTypes = [] as SearchResult[];

  for (const key in unformattedData) {
    if (Object.hasOwnProperty.call(unformattedData, key)) {
      const element = unformattedData[key];
      if (isArray(element)) {
        element.map((i) =>
          allTypes.push({
            type: key === "topHit" ? "topHit" : i.__typename,
            entity: i.__typename,
            ...flattenObj(i),
          } as SearchResult)
        );
      } else if (isArray(element["hits"])) {
        element["hits"].map((i) =>
          allTypes.push({
            type: key === "topHit" ? "topHit" : i.entity,
            entity: i.entity,
            ...flattenObj(i.object),
          } as SearchResult)
        );
      }
    }
  }

  return allTypes;
};

export const addSearchToLocalStorage = (item) => {
  const recentItems =
    JSON.parse(localStorage.getItem("search-history") || "[]") || [];
  const existingIndex = containsObject(item, recentItems);

  if (existingIndex >= 0) {
    recentItems.splice(existingIndex, 1);
  }
  const recentItemsDeepCopy = [...recentItems];

  item && recentItemsDeepCopy.unshift(item);
  exceedsArrayLengthLimit(recentItemsDeepCopy) && recentItemsDeepCopy.pop();
  item &&
    localStorage.setItem("search-history", JSON.stringify(recentItemsDeepCopy));
};

export const containsObject = (obj, list) => {
  for (let i = 0; i < list.length; i++) {
    if (JSON.stringify(list[i]) === JSON.stringify(obj)) {
      return i;
    }
  }

  return -1;
};

export const clearAllRecent = () => {
  localStorage.removeItem("search-history");
};

export const commaSeparate = format(",");

const mapStandardKeys = (origionalKey: string) => {
  switch (origionalKey) {
    case "studyId":
      return "id";
    case "traitReported":
      return "name";
    case "approvedName":
      return "name";
    case "approvedSymbol":
      return "symbol";
    case "functionDescriptions":
      return "description";
    default:
      return origionalKey;
  }
};

const flattenObj = (ob) => {
  const result = {};

  for (const i in ob) {
    if (typeof ob[i] === "object" && !Array.isArray(ob[i])) {
      const temp = flattenObj(ob[i]);
      for (const j in temp) {
        result[j] = temp[j];
      }
    } else {
      if(i === "functionDescriptions") {
        result[mapStandardKeys(i)] = ob[i][0];
      } else {
        result[mapStandardKeys(i)] = ob[i];
      }
    }
  }
  return result;
};

const isArray = (value) => {
  return Array.isArray(value) && value.length > 0;
};

const exceedsArrayLengthLimit = (array) => {
  const limitLength = 10;
  let exceedsLimit = false;

  if (array.length > limitLength) {
    exceedsLimit = true;
  }
  return exceedsLimit;
};
