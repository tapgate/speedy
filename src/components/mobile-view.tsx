import { ReactNode } from 'react';
import { useNavigator } from '../context/navigation';
import Page from './page';

export interface IMobileViewProps {
  children: ReactNode;
  title?: string;
}

function MobileView(props: IMobileViewProps) {
  const { showMenu, toggleMenu } = useNavigator();

  return (
    <Page title={props.title}>
      <div
        className="w-full h-full md:p-10"
        style={{ width: 'calc(100% + 18px)', paddingRight: '18px' }}>
        <div className="w-full h-full flex justify-center items-center">
          <div className="relative w-full md:max-w-[500px] h-full md:border-8 border-tapgate-black md:shadow-lg rounded-lg overflow-hidden">
            <div className="relative h-full">
              <div className="absolute w-full h-full inset-0">{props.children}</div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export default MobileView;
