import React from 'react';
import { ListTooltip } from 'ot-ui';
import { Manhattan } from 'ot-charts';

import { tableColumns } from './ManhattanTable';

class ManhattanWithTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      anchorData: null,
      open: false,
    };
    this.handleMouseover = this.handleMouseover.bind(this);
    this.handleMouseout = this.handleMouseout.bind(this);
  }
  handleMouseover(d, el) {
    this.setState({
      open: true,
      anchorEl: el,
      anchorData: d,
    });
  }
  handleMouseout() {
    this.setState({
      open: false,
      anchorEl: null,
      anchorData: null,
    });
  }
  render() {
    const { data } = this.props;
    const { anchorEl, anchorData, open } = this.state;
    const dataList = anchorData
      ? tableColumns.map(({ label, key, renderCell }) => ({
          label,
          value: renderCell ? renderCell(anchorData) : anchorData[key],
        }))
      : [];
    return (
      <React.Fragment>
        <Manhattan
          data={data}
          handleMouseover={this.handleMouseover}
          handleMouseout={this.handleMouseout}
        />
        <ListTooltip open={open} anchorEl={anchorEl} dataList={dataList} />
      </React.Fragment>
    );
  }
}

export default ManhattanWithTooltip;
