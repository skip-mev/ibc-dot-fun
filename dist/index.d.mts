import * as react from 'react';

declare const Provider: ({ children }: {
    children?: React.ReactNode;
}) => react.JSX.Element;
declare const Widget: () => react.JSX.Element;

export { Provider, Widget };
