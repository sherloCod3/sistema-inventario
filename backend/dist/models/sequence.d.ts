interface ISequence {
    _id: string;
    seq: number;
}
export declare const SequenceModel: import("mongoose").Model<ISequence, {}, {}, {}, import("mongoose").Document<unknown, {}, ISequence> & ISequence & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export {};
