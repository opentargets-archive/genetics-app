import React from 'react';

const Group = ({ children, Heading, headingProps, label }) => (
  <div>
    <Heading {...headingProps}>{label}</Heading>
    <div>{children}</div>
  </div>
);

export default Group;
