import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

export const listClientes = async (req: AuthRequest, res: Response) => {
  try {
    const busca = req.query.busca ? String(req.query.busca).trim() : '';

    const clientes = await prisma.cliente.findMany({
      include: {
        agendamentos: {
          orderBy: { dataHora: 'desc' },
          include: {
            imagens: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = busca
      ? clientes.filter((c) => {
          const term = busca.toLowerCase();
          return (
            c.nome.toLowerCase().includes(term) ||
            c.telefone.toLowerCase().includes(term) ||
            (c.instagram || '').toLowerCase().includes(term) ||
            (c.cidade || '').toLowerCase().includes(term)
          );
        })
      : clientes;

    res.json(filtered);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao carregar lista de clientes.' });
  }
};

export const getClienteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        agendamentos: {
          orderBy: { dataHora: 'desc' },
          include: {
            imagens: true,
            tatuador: {
              select: { id: true, nome: true, especialidade: true },
            },
          },
        },
        orcamentos: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao carregar dados do cliente.' });
  }
};

export const createCliente = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, telefone, email, instagram, cidade, dataNascimento, observacoes } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone/WhatsApp são obrigatórios.' });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: String(nome).trim(),
        telefone: String(telefone).trim(),
        email: email ? String(email).trim() : null,
        instagram: instagram ? String(instagram).trim() : null,
        cidade: cidade ? String(cidade).trim() : 'Curitiba',
        dataNascimento: dataNascimento ? String(dataNascimento).trim() : null,
        observacoes: observacoes ? String(observacoes).trim() : null,
      },
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
  }
};

export const updateCliente = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, instagram, cidade, dataNascimento, observacoes } = req.body;

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: nome ? String(nome).trim() : undefined,
        telefone: telefone ? String(telefone).trim() : undefined,
        email: email !== undefined ? (email ? String(email).trim() : null) : undefined,
        instagram: instagram !== undefined ? (instagram ? String(instagram).trim() : null) : undefined,
        cidade: cidade !== undefined ? (cidade ? String(cidade).trim() : null) : undefined,
        dataNascimento:
          dataNascimento !== undefined ? (dataNascimento ? String(dataNascimento).trim() : null) : undefined,
        observacoes: observacoes !== undefined ? (observacoes ? String(observacoes).trim() : null) : undefined,
      },
    });

    res.json(cliente);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados do cliente.' });
  }
};

export const deleteCliente = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.cliente.delete({ where: { id } });
    res.json({ message: 'Cliente removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao remover cliente.' });
  }
};
