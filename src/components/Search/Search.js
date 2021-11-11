import React from 'react';
import AsyncSelect from 'react-select/lib/Async';
import { withStyles } from '@material-ui/core/styles';

import Placeholder from './Placeholder';
import NoOptionsMessage from './NoOptionsMessage';
import Control from './Control';
import SingleValue from './SingleValue';
import ValueContainer from './ValueContainer';
import DropdownIndicator from './DropdownIndicator';
import Menu from './Menu';
import OptionContainer from './OptionContainer';
import GroupHeading from './GroupHeading';
import Group from './Group';

const styles = theme => ({
  root: {
    position: 'relative',
    minWidth: '450px',
  },
});

const IndicatorSeparator = () => null;

const Search = ({
  classes,
  theme,
  optionComponent: OptionComponent,
  onInputChange,
  onSelectOption,
  onFocus,
  value,
  placeholder,
  white,
}) => {
  const selectStyles = {
    input: base => ({
      ...base,
      color: theme.palette.text.primary,
    }),
  };

  const Option = props => (
    <OptionContainer {...props}>
      <OptionComponent data={props.data} />
    </OptionContainer>
  );

  const components = {
    Option,
    Control: props => <Control white={white} {...props} />,
    NoOptionsMessage,
    Placeholder,
    SingleValue,
    ValueContainer,
    Menu,
    DropdownIndicator,
    GroupHeading,
    Group,
    IndicatorSeparator,
  };

  return (
    <div className={classes.root}>
      <AsyncSelect
        loadOptions={onInputChange}
        styles={selectStyles}
        components={components}
        value={value}
        onChange={onSelectOption}
        onFocus={onFocus}
        placeholder={placeholder}
      />
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(Search);
