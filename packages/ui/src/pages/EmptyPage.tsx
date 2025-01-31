import {
  Button,
  Grid,
  Typography,
  colors,
  makeStyles,
} from "@material-ui/core";
import { ReactNode } from "react";
import { Link } from "../components/Link";
import BrokenSearchIcon from "../components/icons/BrokenSearchIcon";

const useStyles = makeStyles((theme) => ({
  hiddenMobile: {
    "@media (max-width: 767px)": {
      display: "none",
    },
  },
  messageContainer: {
    minHeight: "500px",
    display: "flex",
    justifyContent: "center",
    height: "80vh",
    alignItems: "center",
  },
  messageLogoContainer: {},
  divider: {
    borderRight: `1px solid ${theme.palette.grey[500]}`,
    height: "65%",
    margin: "0 4em",
  },
  messageBodyHeader: {
    color: theme.palette.primary.main,
    fontWeight: "700",
  },
  messageBottom: {
    display: "flex",
    justifyContent: "center",
  },
  marginTop: {
    marginTop: "2em",
  },
  mainIcon: {
    fontSize: "13em",
  },
  messageBodyContainer: {
    padding: "4em 0"
  },
}));

type EmptyPageProps = {
  children: ReactNode;
  documentationLink?: string;
};
function EmptyPage({
  children,
  documentationLink = "https://platform-docs.opentargets.org",
}: EmptyPageProps) {
  const classes = useStyles();

  return (
    <div className={classes.messageContainer}>
      <div
        className={`${classes.messageLogoContainer} ${classes.hiddenMobile} ${classes.mainIcon}`}
      >
        <BrokenSearchIcon/>
      </div>
      <div className={`${classes.divider} ${classes.hiddenMobile}`}></div>
      <div className="message-body-container">
        <Typography variant="h2" className={classes.messageBodyHeader}>
          404: Page not found
        </Typography>
        <div className={classes.messageBodyContainer}>
          <div>{children}</div>
          <Typography>
            You deserve a fresh start. Maybe our
            <Link to={documentationLink}> Documentation</Link> or{" "}
            <Link to={"https://community.opentargets.org/"}>
              Community page
            </Link>{" "}
            can help!
          </Typography>
          <Typography
            className={`${classes.messageBottom} ${classes.marginTop}`}
          >
            or
          </Typography>
        </div>
        <div className={`${classes.messageBottom} `}>
          <Button href="/" variant="contained" color="primary">
            Go back to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EmptyPage;
