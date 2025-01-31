import { useHistory } from "react-router-dom";
import { addSearchToLocalStorage } from "../components/Search/utils/searchUtils";

function useListOption() {
  let history = useHistory();

  const openListItem = (option) => {
    
    if (!option) return;
    option.type= "recent";
    addSearchToLocalStorage(option);

    if (option.entity === "search") {
      history.push(`/search?q=${option.name}&page=1`);
    }else if (option.entity === "study") {
      history.push(`/${option.entity}/${option.studyId}`);
    } else {
      history.push(
        `/${option.entity}/${option.id}${
          option.entity !== "drug" ? "/associations" : ""
        }`
      );
    }
  };

  return [openListItem];
}

export default useListOption;
