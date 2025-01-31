import React from 'react';

import Link from '../Link';

function ExternalLink({
  title,
  id,
  url,
}: {
  title: string,
  id: string,
  url: string,
}) {
  if (!id) return null;

  return (
    <span>
      {title}:{' '}
      <Link external to={url}>
        {id}
      </Link>
    </span>
  );
}

export default ExternalLink;
