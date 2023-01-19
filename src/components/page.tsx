import { ReactNode, useEffect, useState } from 'react';

export interface IPageProps {
  children: ReactNode;
  title?: string;
}

function Page(props: IPageProps) {
  const [defaultTitle] = useState('Tapgate 2.0');

  useEffect(() => {
    if (props.title) document.title = `${props.title} | Tapgate 2.0`;
    else document.title = defaultTitle;
  }, [props.title]);

  return <>{props.children}</>;
}

export default Page;
