import { Grid, Typography } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { makeStyles } from "@material-ui/core/styles";

import { Link } from "./Link";
import { EmailLink } from "./EmailLink";

const FOOTER_BACKGROUND_COLOR = "#2e2d35";

const useStyles = makeStyles(() => ({
  footer: {
    backgroundColor: FOOTER_BACKGROUND_COLOR,
    color: "#fff",
    margin: 0,
    width: "100%",
    padding: 24,
  },
}));

const useLinkStyles = makeStyles(() => ({
  iconClass: {
    marginRight: "10px",
  },
  linkContainer: {
    marginBottom: "8px",
  },
}));

const FooterLink = ({ label, url, icon }) => {
  const classes = useLinkStyles();
  return (
    <Grid item xs={12} className={classes.linkContainer}>
      <Typography color="inherit">
        {url.startsWith("mailto") ? (
          <EmailLink href={url} label={label} icon={icon} />
        ) : (
          <Link external footer to={url}>
            {icon && (
              <FontAwesomeIcon
                className={classes.iconClass}
                icon={icon}
                size="lg"
              />
            )}
            {label}
          </Link>
        )}
      </Typography>
    </Grid>
  );
};

const FooterSectionHeading = ({ children }) => (
  <Grid item xs={12}>
    <Typography variant="h6" color="inherit">
      {children}
    </Typography>
  </Grid>
);

const useSocialLinkStyle = makeStyles(() => ({
  iconsContainer: {
    maxWidth: "235px",
  },
  socialIcon: {
    fontSize: "30px",
    color: "white",
  },
}));

const FooterSocial = ({ social }) => {
  const classes = useSocialLinkStyle();
  return (
    <>
      <FooterSectionHeading>Follow us</FooterSectionHeading>
      <Grid
        className={classes.iconsContainer}
        container
        justifyContent="space-between"
      >
        {social.map(({ icon, url }, i) => (
          <Grid item key={i}>
            <Link external footer to={url}>
              <FontAwesomeIcon className={classes.socialIcon} icon={icon} />
            </Link>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const useSectionStyles = makeStyles({
  section: {
    width: "100%",
  },
});

const FooterSection = ({
  heading,
  links,
  social,
  children,
}: {
  heading: React.ReactNode;
  links: {
    showOnlyPartner: boolean;
    label: string;
    icon: unknown;
    url: string;
  }[];
  social?: unknown;
  children?: React.ReactNode;
}) => {
  const classes = useSectionStyles();
  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={3}
      container
      direction="column"
      justifyContent="space-between"
    >
      <Grid item className={classes.section}>
        <FooterSectionHeading>{heading}</FooterSectionHeading>
        {links.map((link, i) => {
          return (
            <FooterLink
              key={i}
              label={link.label}
              url={link.url}
              icon={link.icon}
            />
          );
        })}
      </Grid>

      {social ? (
        <Grid item>
          <FooterSocial social={social} />
        </Grid>
      ) : null}
      {children}
    </Grid>
  );
};

// Creative Commons License
const useLicenseStyles = makeStyles({
  icon: {
    height: "22px !important",
    marginLeft: "3px",
    verticalAlign: "middle",
  },
  link: {
    display: "inline-block",
  },
});

const LicenseCC0 = ({ links }) => {
  const classes = useLicenseStyles();
  return (
    <div>
      <Typography color="inherit" variant="caption">
        <Link to={links.url} external footer className={classes.link}>
          {links.label}
        </Link>{" "}
        is marked with{" "}
        <Link
          to="http://creativecommons.org/publicdomain/zero/1.0?ref=chooser-v1"
          external
          footer
          className={classes.link}
        >
          CC0 1.0
          <img
            className={classes.icon}
            src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
          />
          <img
            className={classes.icon}
            src="https://mirrors.creativecommons.org/presskit/icons/zero.svg?ref=chooser-v1"
          />
        </Link>
      </Typography>
    </div>
  );
};

const Footer = ({ externalLinks }) => {
  const classes = useStyles();
  return (
    <Grid
      className={classes.footer}
      container
      justifyContent="center"
      spacing={3}
    >
      <Grid item container xs={12} md={10} spacing={2}>
        <FooterSection heading="About" links={externalLinks.about}>
          <LicenseCC0 links={externalLinks.license} />
        </FooterSection>
        <FooterSection
          heading="Help"
          links={externalLinks.help}
          social={externalLinks.social}
        />
        <FooterSection heading="Partners" links={externalLinks.partners} />
        <FooterSection
          heading="About Open Targets"
          links={externalLinks.network}
        />
      </Grid>
    </Grid>
  );
};

export default Footer;
