"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSequence = exports.getCurrentSequence = exports.getNextPatrimonyId = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("../config/logger");
const sequenceSchema = new mongoose_1.Schema({
    _id: String,
    seq: { type: Number, default: 0 }
});
const Sequence = (0, mongoose_1.model)('Sequence', sequenceSchema);
const getNextPatrimonyId = async () => {
    try {
        const maxRetries = 3;
        let retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                const sequence = await Sequence.findOneAndUpdate({ _id: 'patrimonyId' }, { $inc: { seq: 1 } }, {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                    writeConcern: { w: 'majority' }
                });
                if (!sequence) {
                    throw new Error('Falha ao gerar número de patrimônio');
                }
                return `PAT${String(sequence.seq).padStart(4, '0')}`;
            }
            catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
            }
        }
        throw new Error('Excedido número máximo de tentativas');
    }
    catch (error) {
        logger_1.logger.error('Erro ao gerar número de patrimônio:', error);
        throw new Error('Falha ao gerar número de patrimônio');
    }
};
exports.getNextPatrimonyId = getNextPatrimonyId;
const getCurrentSequence = async () => {
    try {
        const sequence = await Sequence.findById('patrimonyId');
        return (sequence === null || sequence === void 0 ? void 0 : sequence.seq) || 0;
    }
    catch (error) {
        logger_1.logger.error('Erro ao buscar sequência atual:', error);
        throw new Error('Falha ao buscar sequência atual');
    }
};
exports.getCurrentSequence = getCurrentSequence;
const resetSequence = async () => {
    try {
        await Sequence.findOneAndUpdate({ _id: 'patrimonyId' }, { seq: 0 }, { upsert: true });
    }
    catch (error) {
        logger_1.logger.error('Erro ao resetar sequência:', error);
        throw new Error('Falha ao resetar sequência');
    }
};
exports.resetSequence = resetSequence;
//# sourceMappingURL=sequenceService.js.map