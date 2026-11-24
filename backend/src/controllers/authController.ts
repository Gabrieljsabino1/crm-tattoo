import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isMatch = await bcrypt.compare(senha, user.senha);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        especialidade: user.especialidade,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

export const registerFirstAdmin = async (req: Request, res: Response) => {
  try {
    const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (adminExists) {
      return res.status(400).json({ error: 'Um administrador já existe no sistema.' });
    }

    const { nome, email, senha, especialidade } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const newAdmin = await prisma.user.create({
      data: {
        nome,
        email: String(email).trim().toLowerCase(),
        senha: hashedPassword,
        role: 'ADMIN',
        especialidade: especialidade || 'Tatuador Principal',
      },
    });

    res.status(201).json({ message: 'Admin criado com sucesso!', adminId: newAdmin.id });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ error: 'Erro ao criar administrador.' });
  }
};
