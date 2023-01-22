import PageHeader from './page-header';

export function WithPageHeader(props: any) {
  return (
    <div className="w-full h-full">
      <PageHeader {...{ ...props, className: 'w-full h-[70px]', Children: null }} />
      <div className="w-full overflow-auto" style={{ height: 'calc(100% - 70px)' }}>
        {props.children}
      </div>
    </div>
  );
}

export default WithPageHeader;
