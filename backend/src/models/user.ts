import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

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

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // Não retorna a senha nas consultas por padrão
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para verificar senha
userSchema.methods.checkPassword = async function(password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error('Erro ao verificar senha');
  }
};

export const UserModel = model<UserDocument>('User', userSchema);