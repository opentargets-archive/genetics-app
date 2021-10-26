import { gql, useQuery } from '@apollo/client';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

// HELPERS
function getVersion({ month, year }) {
  return `${year}.${month < 10 ? '0' : ''}${month}`;
}

function getFullMonth({ month, year }) {
  const date = new Date(year + 2000, month - 1);
  return date.toLocaleString('default', { month: 'long' });
}

// QUERY
const DATA_VERSION_QUERY = gql`
  query DataVersion {
    meta {
      dataVersion {
        major
        minor
      }
    }
  }
`;

const styles = () => ({
  container: {
    display: 'flex',
    marginTop: 5,
    justifyContent: 'center',
    alignContent: 'center',
  },
});

// MAIN COMPONENT
function Version({ classes }) {
  const { data, loading, error } = useQuery(DATA_VERSION_QUERY);
  if (error) {
    return null;
  }
  if (loading)
    return (
      <div className={classes.container}>
        <Typography>Loading data version ...</Typography>
      </div>
    );
  const {
    meta: {
      dataVersion: { major, minor },
    },
  } = data;
  const version = getVersion({ month: minor, year: major });
  const fullMonth = getFullMonth({ month: minor, year: major });

  return (
    <div className={classes.container}>
      <Typography>
        <Link
          underline="none"
          href="https://genetics-docs.opentargets.org/release-notes"
        >
          {fullMonth} 20
          {major} ({version})
        </Link>
      </Typography>
    </div>
  );
}

export default withStyles(styles)(Version);
