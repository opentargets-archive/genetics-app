import React, { Component } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import HelpIcon from '@material-ui/icons/Help';

import PlotContainer from './PlotContainer';
import PlotContainerSection from './PlotContainerSection';
import downloadTable from '../helpers/downloadTable';

const PAGE_SIZE = 10;

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
  },
});

class TablePaginationActions extends Component {
  handleFirstPageButtonClick = event => {
    this.props.onPageChange(event, 0);
  };

  handleBackButtonClick = event => {
    const { onPageChange, page } = this.props;
    onPageChange(event, page - 1);
  };

  handleNextButtonClick = event => {
    const { onPageChange, page } = this.props;
    onPageChange(event, page + 1);
  };

  handleLastPageButtonClick = event => {
    const { onPageChange, count, rowsPerPage } = this.props;
    const lastPage = Math.ceil(count / rowsPerPage) - 1;
    onPageChange(event, lastPage);
  };

  render() {
    const { count, page, rowsPerPage, classes } = this.props;
    const lastPage = Math.ceil(count / rowsPerPage) - 1;
    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          <FirstPageIcon />
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= lastPage}
          aria-label="Next Page"
        >
          <KeyboardArrowRight />
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= lastPage}
          aria-label="Last Page"
        >
          <LastPageIcon />
        </IconButton>
      </div>
    );
  }
}

TablePaginationActions = withStyles(actionsStyles)(TablePaginationActions);

const getComparator = (columns, sortBy, order) => {
  const column = columns.find(col => col.id === sortBy);

  if (column && column.comparator) {
    if (order === 'asc') {
      return column.comparator;
    }
    return (a, b) => -column.comparator(a, b);
  }

  const comparatorValue = order === 'desc' ? 1 : -1;

  return (a, b) => {
    if (a[sortBy] === b[sortBy]) {
      return 0;
    }

    if (a[sortBy] === undefined || a[sortBy] === '' || a[sortBy] < b[sortBy]) {
      return comparatorValue;
    }

    if (b[sortBy] === undefined || b[sortBy] === '' || a[sortBy] > b[sortBy]) {
      return -comparatorValue;
    }
  };
};

const tableStyles = theme => ({
  tableWrapper: {
    overflowX: 'auto',
  },
  tooltipIcon: {
    fontSize: '1.2rem',
    paddingLeft: `0.6rem`,
  },
  buttonMargin: {
    marginRight: '4px',
  },
  tableRow: {
    height: '31px',
  },
  tableRowFixed: {
    background: theme.palette.grey[300],
  },
  tableRowFilters: {
    verticalAlign: 'bottom',
  },
  tableCell: {
    padding: '0 12px 0 0',
    '&:first-child': {
      paddingLeft: '24px',
    },
    '&:last-child': {
      paddingRight: '24px',
    },
  },
  tableCellHeader: {
    paddingRight: '12px',
    paddingLeft: 0,
    '&:first-child': {
      paddingLeft: '24px',
    },
    '&:last-child': {
      paddingRight: '24px',
    },
  },
  tableCellHeaderVertical: {
    textAlign: 'center',
    verticalAlign: 'bottom',
  },
  tableCellVertical: {
    minWidth: '24px',
    width: '24px',
    paddingRight: 0,
  },
  tableCellFill: {
    width: '100%',
  },
  verticalHeader: {
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    whiteSpace: 'nowrap',
  },
  downloadHeader: {
    marginTop: '7px',
  },
  badgeWithTooltip: {
    flexShrink: 1,
  },
});

class OtTable extends Component {
  state = {
    page: 0,
    sortBy: this.props.sortBy,
    order: this.props.order,
  };

  handleChangePage = (event, page) => {
    this.setState({
      page,
    });
  };

  selectSortColumn = sortBy => {
    const { reportTableSortEvent } = this.props;
    let order = 'desc';

    if (this.state.sortBy === sortBy && this.state.order === 'desc') {
      order = 'asc';
    }

    if (reportTableSortEvent) {
      reportTableSortEvent(sortBy, order);
    }

    this.setState({ sortBy, order });
  };

  handleTableDownload = format => {
    const {
      columns,
      data,
      downloadFileStem,
      excludeDownloadColumns,
      reportTableDownloadEvent,
    } = this.props;

    if (reportTableDownloadEvent) {
      reportTableDownloadEvent(format);
    }

    const headerMap = excludeDownloadColumns
      ? columns.filter(column => !excludeDownloadColumns.includes(column.id))
      : columns;

    downloadTable({
      headerMap,
      rows: data,
      format,
      filenameStem: downloadFileStem,
    });
  };

  render() {
    const {
      loading,
      error,
      columns,
      data,
      columnsFixed,
      dataFixed,
      verticalHeaders,
      classes,
      left,
      center,
      message,
      filters,
      pageSize,
    } = this.props;
    const { sortBy, order, page } = this.state;
    const filterRow = filters ? (
      <TableRow className={classes.tableRowFilters}>
        {columns.map(column => (
          <TableCell key={column.id} className={classes.tableCellHeader}>
            {column.renderFilter ? column.renderFilter() : null}
          </TableCell>
        ))}
      </TableRow>
    ) : null;
    return (
      <PlotContainer
        loading={loading}
        error={error}
        left={left}
        center={center}
        right={
          <Grid container justifyContent="flex-end" spacing={1}>
            <Grid item>
              <Typography variant="caption" className={classes.downloadHeader}>
                Download table as
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={this.handleTableDownload.bind(null, 'json')}
              >
                JSON
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={this.handleTableDownload.bind(null, 'csv')}
              >
                CSV
              </Button>
            </Grid>
            <Grid item className={classes.buttonMargin}>
              <Button
                variant="outlined"
                onClick={this.handleTableDownload.bind(null, 'tsv')}
              >
                TSV
              </Button>
            </Grid>
          </Grid>
        }
      >
        {message ? (
          <PlotContainerSection>
            <div align="center">
              <Typography variant="subtitle1">{message}</Typography>
            </div>
          </PlotContainerSection>
        ) : null}
        <PlotContainerSection>
          <div className={classes.tableWrapper}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      className={classNames(classes.tableCellHeader, {
                        [classes.tableCellHeaderVertical]:
                          column.verticalHeader,
                        [classes.tableCellVertical]: column.verticalHeader,
                      })}
                    >
                      <TableSortLabel
                        active={column.id === sortBy}
                        direction={order}
                        onClick={this.selectSortColumn.bind(null, column.id)}
                        className={
                          column.verticalHeader ? classes.verticalHeader : null
                        }
                      >
                        {column.tooltip ? (
                          <Badge
                            className={classes.badgeWithTooltip}
                            badgeContent={
                              <Tooltip
                                title={column.tooltip}
                                placement="top"
                                interactive
                              >
                                <HelpIcon className={classes.tooltipIcon} />
                              </Tooltip>
                            }
                          >
                            {column.label}
                          </Badge>
                        ) : (
                          column.label
                        )}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  {verticalHeaders ? (
                    <TableCell className={classes.tableCellFill} />
                  ) : null}
                </TableRow>
                {filterRow}
              </TableHead>
              <TableBody>
                {columnsFixed && dataFixed
                  ? dataFixed.map((row, index) => (
                      <TableRow
                        key={index}
                        className={classNames(
                          classes.tableRow,
                          classes.tableRowFixed
                        )}
                      >
                        {columnsFixed.map(column => (
                          <TableCell
                            key={column.id}
                            className={classNames(classes.tableCell, {
                              [classes.tableCellVertical]:
                                column.verticalHeader,
                            })}
                          >
                            {column.renderCell
                              ? column.renderCell(row)
                              : row[column.id]}
                          </TableCell>
                        ))}
                        {verticalHeaders ? (
                          <TableCell className={classes.tableCellFill} />
                        ) : null}
                      </TableRow>
                    ))
                  : null}
                {data
                  .slice()
                  .sort(getComparator(columns, sortBy, order))
                  .slice(page * pageSize, page * pageSize + pageSize)
                  .map((row, index) => (
                    <TableRow key={index} className={classes.tableRow}>
                      {columns.map(column => (
                        <TableCell
                          key={column.id}
                          className={classNames(classes.tableCell, {
                            [classes.tableCellVertical]: column.verticalHeader,
                          })}
                        >
                          {column.renderCell
                            ? column.renderCell(row)
                            : row[column.id]}
                        </TableCell>
                      ))}
                      {verticalHeaders ? (
                        <TableCell className={classes.tableCellFill} />
                      ) : null}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {!loading && data.length === 0 ? (
            <PlotContainerSection>
              <div align="center">
                <Typography variant="subtitle1">(no data)</Typography>
              </div>
            </PlotContainerSection>
          ) : null}
          <TablePagination
            component="div"
            count={data.length}
            onPageChange={this.handleChangePage}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[]}
            ActionsComponent={TablePaginationActions}
          />
        </PlotContainerSection>
      </PlotContainer>
    );
  }
}

OtTable.defaultProps = {
  pageSize: PAGE_SIZE,
};

export default withStyles(tableStyles)(OtTable);
