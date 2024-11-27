"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceModel = void 0;
// src/models/sequence.ts
const mongoose_1 = require("mongoose");
const sequenceSchema = new mongoose_1.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
exports.SequenceModel = (0, mongoose_1.model)('Sequence', sequenceSchema);
//# sourceMappingURL=sequence.js.map