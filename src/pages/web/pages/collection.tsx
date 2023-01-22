import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemImage from '../../../components/item-image';
import MobileView from '../../../components/mobile-view';
import WithPageHeader from '../../../components/with-page-header';
import CollectionProvider, { useCollection } from '../../../context/collection';
import { useUser } from '../../../context/user';

const CollectionPage = () => {
  const { items } = useCollection();

  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    console.log('items changed', items);

    setTotalItems(items?.reduce((x, y) => x + y.amount, 0) ?? 0);
  }, [items]);

  return (
    <div className="w-full h-full">
      <WithPageHeader title="My Collection">
        <div className="w-full h-full p-4 overflow-auto">
          <div className="w-full flex flex-wrap">
            {items?.map((item) => {
              return (
                <div
                  key={item.id}
                  className="w-1/3 max-w-[155px] max-h-[200px] p-4"
                  style={{ height: '40vw' }}>
                  <div className="relative w-full h-full shadow-md">
                    {item.amount > 1 && (
                      <div className="absolute top-[-10px] right-[-10px] w-[35px] h-[35px] bg-tapgate-black-600 border-4 border-tapgate-black rounded-full">
                        <div className="w-full h-full flex justify-center items-center text-xs">
                          {item.amount}
                        </div>
                      </div>
                    )}
                    <div className="w-full h-full overflow-hidden rounded-lg">
                      <div className="w-full h-full h-3/4 bg-tapgate-black-600/75">
                        <ItemImage item={item.expand?.item} />
                      </div>
                      <div className="w-full h-full h-1/4 bg-tapgate-black">
                        <div className="w-full h-full flex justify-center items-center text-xs px-2 truncate text-ellipsis">
                          {item.expand?.item?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </WithPageHeader>
    </div>
  );
};

const CollectionPageContainer = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      // navigate to login page
      navigate('/login');
    }
  }, [user]);

  // create loading spinner svg
  return (
    <CollectionProvider>
      <MobileView title="Collection">
        <CollectionPage />
      </MobileView>
    </CollectionProvider>
  );
};

export default CollectionPageContainer;
