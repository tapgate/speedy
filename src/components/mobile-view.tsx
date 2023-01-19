import { useNavigator } from '../context/navigation';

function MobileView(props: any) {
  const { showMenu, toggleMenu } = useNavigator();

  return (
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
  );
}

export default MobileView;
