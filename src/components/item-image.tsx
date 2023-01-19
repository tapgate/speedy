import { useEffect, useState } from 'react';
import { IItem, IItemCategory } from '../models/item';
import { CSSDimensionsWithPixelSize } from '../utils/pixles';
import pocketbase from '../utils/pocketbase';

export interface IItemImageProps {
  item: IItem;
}

function ItemImage(props: IItemImageProps) {
  const [imagePath, setImagePath] = useState<string>('');
  const [category, setCategory] = useState<IItemCategory>();

  useEffect(() => {
    const updateImage = async () => {
      console.log(props.item);

      const category = (await pocketbase
        .collection('item_categories')
        .getOne(props.item.category)) as unknown as IItemCategory;

      setCategory(category);

      if (category) {
        switch (category.name) {
          case 'outfit':
            setImagePath(`/character/outfit/${props.item.code}.png`);
            break;
          case 'truck':
            setImagePath(`trucks/${props.item.code}.png`);
            break;
          case 'track':
            setImagePath(`track/${props.item.code}.png`);
            break;
          case 'mineral':
            setImagePath(`mineral/${props.item.code}.png`);
            break;
        }
      }
    };

    updateImage();
  }, [props.item]);

  if (category) {
    switch (category.name) {
      case 'outfit':
        return (
          <div className="relative w-full h-full overflow-hidden flex justify-center items-center">
            <div className="item-container absolute top-[-50px] w-full h-full">
              <div className={`item`} style={{ ...CSSDimensionsWithPixelSize('32px', '64px') }}>
                <div
                  className={`sheet pixel-art absolute`}
                  style={{
                    ...CSSDimensionsWithPixelSize('128px', '256px'),
                    backgroundImage: `url(/images/${imagePath})`
                  }}></div>
              </div>
            </div>
          </div>
        );
      case 'track':
      case 'mineral':
        return (
          <div className="relative w-full h-full overflow-hidden flex justify-center items-center">
            <div className="item-container absolute top-0 w-full h-full">
              <div className={`item w-full h-full flex justify-center items-center`}>
                <div
                  className={`sheet pixel-art`}
                  style={{
                    ...CSSDimensionsWithPixelSize('25px', '25px'),
                    backgroundImage: `url(/images/${imagePath})`
                  }}></div>
              </div>
            </div>
          </div>
        );
    }
  }

  return <></>;
}

const ItemImageContainer = (props: IItemImageProps) => {
  return (
    <div className="item-image w-full h-full flex justify-center items-center">
      <ItemImage item={props.item} />
    </div>
  );
};

export default ItemImageContainer;
