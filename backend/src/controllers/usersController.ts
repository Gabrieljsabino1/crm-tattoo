import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

export const listUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        especialidade: true,
        createdAt: true,
        _count: {
          select: { agendamentos: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar equipe.' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, email, senha, role, especialidade } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) {
      return res.status(400).json({ error: 'Já existe um usuário com este e-mail.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const user = await prisma.user.create({
      data: {
        nome: String(nome).trim(),
        email: normalizedEmail,
        senha: hashedPassword,
        role: role || 'TATUADOR',
        especialidade: especialidade ? String(especialidade).trim() : null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        especialidade: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar integrante da equipe.' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, role, especialidade } = req.body;

    const data: Record<string, unknown> = {};
    if (nome) data.nome = String(nome).trim();
    if (email) data.email = String(email).trim().toLowerCase();
    if (role) data.role = role;
    if (especialidade !== undefined) data.especialidade = especialidade || null;
    if (senha && String(senha).trim().length >= 4) {
      data.senha = await bcrypt.hash(String(senha), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        especialidade: true,
        createdAt: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar integrante.' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta.' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Integrante removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    res.status(500).json({ error: 'Erro ao remover integrante.' });
  }
};
