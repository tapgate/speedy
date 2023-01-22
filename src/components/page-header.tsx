function Pageheader(props: any) {
  const className =
    'w-full h-full px-8 border-t md:border-0 border-tapgate-black-600 bg-tapgate-black';

  props = { ...props, className: `${props.className ?? ''} ${className}` };

  return (
    <div {...props}>
      <div className="w-full h-full flex justify-between items-center">
        <div>{props.left ?? props.title}</div>
        <div>{props.right ?? props.icon}</div>
      </div>
    </div>
  );
}

export default Pageheader;
