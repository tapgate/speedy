export interface IUser {
    id: string;
    name: string;
    avatar: string;
    collectionId: string;
    collectionName: string;
    created: string;
    email: string;
    emailVisibility: boolean;
    updated: string;
    username: string;
    verified: boolean;
    expand: IExpand;
}

export type IUserSkin = "white"|"black"|"yellow"|"green";

export interface IExpand { }