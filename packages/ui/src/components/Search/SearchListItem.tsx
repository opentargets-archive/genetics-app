import { makeStyles, Typography, Chip } from "@material-ui/core";
import SearchRecentListItem from "./SearchRecentListItem";
import { commaSeparate } from "./utils/searchUtils";

const useStyles = makeStyles((theme) => ({
  justifyBetween: {
    display: "flex",
    justifyContent: "space-between",
  },
  topHitItem: {
    color: theme.palette.primary.main,
  },
  id: {
    padding: "0.3rem 0 0 1rem ",
    fontStyle: "italic",
    overflowWrap: "break-word",
  },
  listItem: {
    cursor: "pointer",
    width: "100%",
  },
  author: {
    display: "flex",
  },
  symbol: {
    textTransform: "capitalize",
    display: "flex",
    alignItems: "center",
  },
}));

export interface SearchResult {
  type: string;
  symbol: string;
  name: string;
  description: string;
  entity: string;
  id: string;
  rsId: string;
  hasSumstats: boolean;
  nInitial: number;
  pubJournal: string;
  chromosome: string;
  functionDescriptions: string[];
  position: string;
  pubAuthor: string;
  pubDate: string;
  numAssocLoci: number;
  end: number;
  start: number;
}

function SearchListItem({
  item,
  isTopHit = false,
  clearItem,
}: {
  item: SearchResult;
  isTopHit: boolean;
  clearItem: (item: SearchResult) => void;
}) {
  const classes = useStyles();

  if (item.type === "recent") {
    return <SearchRecentListItem item={item} clearItem={clearItem} />;
  }

  const getSymbolHeader = () => {
    if (!(item.entity === "search") && item.symbol && item.name)
      return (
        <>
          <Typography variant={isTopHit ? "h6" : "subtitle1"}>
            {item.symbol}
          </Typography>
          -
          <Typography variant={isTopHit ? "subtitle1" : "subtitle2"}>
            {item.name}
          </Typography>
        </>
      );
    else
      return (
        <>
          <Typography variant="subtitle1">
            {item.symbol || item.name || item.id}
          </Typography>
        </>
      );
  };

  return (
    <>
      <div className={classes.listItem}>
        <div className={classes.justifyBetween}>
          <span
            className={`${classes.symbol} ${isTopHit && classes.topHitItem}`}
          >
            {getSymbolHeader()}
          </span>
          <Typography variant="caption">
            <span className={classes.id}>{item.id}</span>
          </Typography>
        </div>
        {isTopHit &&
          item.description && (
            <div className="functionDescription">
              <Typography variant="subtitle1">
                {item.description.substring(0, 180)} ...{" "}
              </Typography>
            </div>
          )}

        <div className={classes.justifyBetween}>
          <Typography variant="caption">
            <span className={classes.author}>
              {item.pubAuthor && item.pubAuthor}
              {item.pubDate && ` (` + item.pubDate.substring(0, 4) + `)`}
            </span>
            <span className={classes.author}>
              {item.position &&
                item.chromosome &&
                `GRCh38:` +
                  item.chromosome +
                  `:` +
                  commaSeparate(Number(item.position))}
            </span>
          </Typography>
          <Typography variant="caption">
            {item.pubJournal && item.pubJournal}
          </Typography>
        </div>

        {item.rsId && (
          <Typography variant="caption">
            <strong>
              <div className="loci"> Ensembl: {item.rsId}</div>
            </strong>
          </Typography>
        )}

        <div className={classes.justifyBetween}>
          <Typography variant="caption">
            {item.numAssocLoci > -1 && (
              <strong>{item.numAssocLoci} associated loci</strong>
            )}
          </Typography>

          {item.hasSumstats && (
            <Chip
              style={{
                height: "16px",
                fontSize: "0.8rem",
                margin: "0",
              }}
              color="primary"
              label="summary statistics"
            />
          )}
        </div>

        {item.nInitial && (
          <Typography variant="caption">N Study: {item.nInitial}</Typography>
        )}

        <div className="numbers">
          <Typography variant="caption">
            {item.start} {item.start && item.end && `-`} {item.end}
          </Typography>
        </div>
      </div>
    </>
  );
}

export default SearchListItem;
