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
          case 'minereal':
            setImagePath(`minereals/${props.item.code}.png`);
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
            <div className="character-container absolute top-[-50px] w-full h-full">
              <div
                className={`character idle-down`}
                style={{ ...CSSDimensionsWithPixelSize('32px', '64px') }}>
                <div
                  className={`character-outfit pixel-art sheet absolute`}
                  style={{
                    ...CSSDimensionsWithPixelSize('128px', '256px'),
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
