import { Document } from 'mongoose';
export interface User {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    active: boolean;
    lastLogin?: Date;
}
export interface UserDocument extends User, Document {
    checkPassword(password: string): Promise<boolean>;
}
export declare const UserModel: import("mongoose").Model<UserDocument, {}, {}, {}, Document<unknown, {}, UserDocument> & UserDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
