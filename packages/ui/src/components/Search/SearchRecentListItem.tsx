import { Typography } from "@material-ui/core";
import { History, Clear } from "@material-ui/icons";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  recentItemContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    width: "100%",
  },
  recentIcon: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  px2: {
    padding: "0 1rem",
  },
});

function SearchRecentListItem({ item, clearItem }) {
  const classes = useStyles();

  const stopEvent = (event, item) => {
    event.stopPropagation();
    clearItem(item);
  };

  return (
    <div className={classes.recentItemContainer}>
      <div className={classes.recentIcon}>
        <History />
        <Typography variant="subtitle2">
          {item.symbol || item.name || item.id}
        </Typography>
      </div>

      <Clear onClick={(event) => stopEvent(event, item)} />
    </div>
  );
}

export default SearchRecentListItem;
