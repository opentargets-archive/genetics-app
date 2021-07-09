import React, { Component } from 'react';
import theme from './theme';

const ATTR_MAP = {
  phewas: 'fill',
  manhattan: 'stroke',
};

const HIGHLIGHT_MAP = {
  phewas: theme.point.highlightColor,
  manhattan: theme.line.highlightColor,
};

const COLOR_MAP = {
  phewas: theme.point.color,
  manhattan: theme.line.color,
};

const ID_MAP = {
  phewas: 'studyId',
  manhattan: 'indexVariantId',
};

function withTooltip(WrappedComponent, ListTooltip, tableColumns, type) {
  return class extends Component {
    state = {
      open: false,
      anchorData: null,
      anchorEl: null,
    };

    handleMouseOver = data => {
      const { anchorEl } = this.state;
      if (anchorEl) {
        anchorEl.setAttribute(
          ATTR_MAP[type],
          anchorEl.dataset.colour || COLOR_MAP[type]
        );
      }

      const loci = document.querySelector(`.loci-${data[ID_MAP[type]]}`);
      loci.setAttribute(ATTR_MAP[type], HIGHLIGHT_MAP[type]);

      this.setState({
        open: true,
        anchorData: data,
        anchorEl: loci,
      });
    };

    handleMouseLeave = event => {
      const { anchorEl } = this.state;
      if (anchorEl) {
        anchorEl.setAttribute(
          ATTR_MAP[type],
          anchorEl.dataset.colour || COLOR_MAP[type]
        );
      }

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
        <div onMouseLeave={this.handleMouseLeave}>
          <WrappedComponent
            handleMouseover={this.handleMouseOver}
            {...this.props}
          />
          <ListTooltip open={open} anchorEl={anchorEl} dataList={dataList} />
        </div>
      );
    }
  };
}

export default withTooltip;
