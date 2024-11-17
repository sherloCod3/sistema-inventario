import { model, Schema } from 'mongoose';
import { logger } from '../config/logger';

interface ISequence {
    _id: string;
    seq: number;
}

const sequenceSchema = new Schema<ISequence>({
    _id: String,
    seq: { type: Number, default: 0 }
});

const Sequence = model<ISequence>('Sequence', sequenceSchema);

export const getNextPatrimonyId = async (): Promise<string> => {
    try {
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const sequence = await Sequence.findOneAndUpdate(
                    { _id: 'patrimonyId' },
                    { $inc: { seq: 1 } },
                    { 
                        new: true, 
                        upsert: true,
                        setDefaultsOnInsert: true,
                        writeConcern: { w: 'majority' }
                    }
                );

                if (!sequence) {
                    throw new Error('Falha ao gerar número de patrimônio');
                }

                return `PAT${String(sequence.seq).padStart(4, '0')}`;
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
            }
        }

        throw new Error('Excedido número máximo de tentativas');
    } catch (error) {
        logger.error('Erro ao gerar número de patrimônio:', error);
        throw new Error('Falha ao gerar número de patrimônio');
    }
};

export const getCurrentSequence = async (): Promise<number> => {
    try {
        const sequence = await Sequence.findById('patrimonyId');
        return sequence?.seq || 0;
    } catch (error) {
        logger.error('Erro ao buscar sequência atual:', error);
        throw new Error('Falha ao buscar sequência atual');
    }
};

export const resetSequence = async (): Promise<void> => {
    try {
        await Sequence.findOneAndUpdate(
            { _id: 'patrimonyId' },
            { seq: 0 },
            { upsert: true }
        );
    } catch (error) {
        logger.error('Erro ao resetar sequência:', error);
        throw new Error('Falha ao resetar sequência');
    }
};