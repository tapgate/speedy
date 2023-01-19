import { IItem } from './item';
import { IUser } from './user';

export interface IUserItem {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  user: string;
  item: string;
  amount: number;
  expand: IUserItemExpand;
}

export interface IUserItemExpand {
  item: IItem;
  user: IUser;
}
