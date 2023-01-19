import { createContext, useState, useContext, useEffect } from 'react';
import pocketbase from '../utils/pocketbase';
import { useNavigate } from 'react-router-dom';
import { IUserItem } from '../models/collection';
import { useUser } from './user';
import { IItem } from '../models/item';

pocketbase.autoCancellation(false);

interface CollectionContext {
  items: IUserItem[] | undefined;
}

const Context = createContext<CollectionContext>({} as CollectionContext);

const CollectionProvider = ({ children }: any) => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [items, setItems] = useState<IUserItem[]>([]);

  useEffect(() => {
    const getItems = async () => {
      const data = await pocketbase.collection('user_items').getFullList(100, {
        sort: '+created',
        expand: 'item'
      });

      console.log('data', data);

      if (data) {
        const items = data as unknown as IUserItem[];
        setItems(items);
      }
    };

    getItems();

    // subscribe to speey game modes realtime updates
    pocketbase.collection('user_items').subscribe('*', (data) => {
      const record = data.record as unknown as IUserItem;

      switch (data.action) {
        case 'insert':
          setItems((prev) => [...prev, record]);
          break;
        case 'update':
          setItems((prev) => {
            const index = prev.findIndex((item) => item.id === record.id);
            prev[index] = record;
            return [...prev];
          });
          break;
        case 'delete':
          setItems((prev) => {
            const index = prev.findIndex((item) => item.id === record.id);
            prev.splice(index, 1);
            return [...prev];
          });
          break;
        default:
          break;
      }
    });

    return () => {
      pocketbase.collection('user_items').unsubscribe('*');
    };
  }, [user]);

  useEffect(() => {
    items?.forEach((item) => {
      if (!item.expand?.item) {
        expand(item);
      }
    });
  }, [items]);

  const expand = async (userItem: IUserItem) => {
    if (userItem) {
      if (!userItem.expand?.item) {
        const item = (await pocketbase.collection('items').getOne(userItem.item)) as IItem;
        if (item) {
          userItem.expand.item = item;

          setItems((prev) => {
            const index = prev.findIndex((item) => item.id === userItem.id);
            prev[index] = userItem;
            return [...prev];
          });
        }
      }
    }
  };

  const exposed = {
    items
  };

  return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useCollection = () => useContext(Context);

export default CollectionProvider;
