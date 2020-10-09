import React from 'react';

type Props = {
  error: any;
};
export function ErrorFeedback({ error }: Props) {
  return (
    <div>
      <p>Something bad happened.</p>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}
