import React, { Component, Fragment } from 'react';
import { ListTooltip } from 'ot-ui';

function withTooltip(WrappedComponent, tableColumns) {
  return class extends Component {
    state = {
      open: false,
      anchorData: null,
      anchorEl: null,
    };

    handleMouseover = (d, el) => {
      this.setState({
        open: true,
        anchorData: d,
        anchorEl: el,
      });
    };

    handleMouseout = () => {
      this.setState({
        open: false,
        anchorData: null,
        anchorEl: null,
      });
    };

    render() {
      const { anchorEl, anchorData, open } = this.state;
      const dataList = anchorData
        ? tableColumns.map(({ label, id, renderCell }) => ({
            label,
            value: renderCell ? renderCell(anchorData) : anchorData[id],
          }))
        : [];
      return (
        <Fragment>
          <WrappedComponent
            handleMouseover={this.handleMouseover}
            handleMouseout={this.handleMouseout}
            {...this.props}
          />
          <ListTooltip open={open} anchorEl={anchorEl} dataList={dataList} />
        </Fragment>
      );
    }
  };
}

export default withTooltip;
