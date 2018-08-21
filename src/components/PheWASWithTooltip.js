import React, { Component, Fragment } from 'react';
import { ListTooltip } from 'ot-ui';
import { PheWAS } from 'ot-charts';

import { tableColumns } from './PheWASTable';

class PheWASWithTooltip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      anchorData: null,
      open: false,
    };
  }

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
    const { data } = this.props;
    const { anchorEl, anchorData, open } = this.state;
    const dataList = anchorData
      ? tableColumns.map(({ label, id, renderCell }) => ({
          label,
          value: renderCell ? renderCell(anchorData) : anchorData[id],
        }))
      : [];
    return (
      <Fragment>
        <PheWAS
          data={data}
          handleMouseover={this.handleMouseover}
          handleMouseout={this.handleMouseout}
        />
        <ListTooltip open={open} anchorEl={anchorEl} dataList={dataList} />
      </Fragment>
    );
  }
}

export default PheWASWithTooltip;
