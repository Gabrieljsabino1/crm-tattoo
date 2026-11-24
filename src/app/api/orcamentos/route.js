import { NextResponse } from 'next/server';
import prisma from '../../../lib/server/prisma';
import { requireAuth, fileToDataUrl } from '../../../lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: { cliente: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orcamentos);
  } catch (err) {
    console.error('Erro ao listar orçamentos:', err);
    return NextResponse.json({ error: 'Erro ao carregar orçamentos.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const contentType = request.headers.get('content-type') || '';
    let data = {};
    let imagemReferenciaUrl = null;

    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData();
      data = {
        titulo: fd.get('titulo'),
        clienteId: fd.get('clienteId'),
        descricao: fd.get('descricao'),
        localCorpo: fd.get('localCorpo'),
        estilo: fd.get('estilo'),
        tamanhoCm: fd.get('tamanhoCm'),
        valorEstimado: fd.get('valorEstimado'),
        status: fd.get('status'),
      };
      const file = fd.get('imagem');
      if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
        imagemReferenciaUrl = await fileToDataUrl(file);
      }
    } else {
      data = await request.json();
    }

    if (!data.titulo || !data.clienteId) {
      return NextResponse.json({ error: 'Título e cliente são obrigatórios.' }, { status: 400 });
    }

    const orcamento = await prisma.orcamento.create({
      data: {
        titulo: String(data.titulo).trim(),
        clienteId: String(data.clienteId),
        descricao: data.descricao ? String(data.descricao).trim() : null,
        localCorpo: data.localCorpo ? String(data.localCorpo).trim() : null,
        estilo: data.estilo ? String(data.estilo).trim() : null,
        tamanhoCm: data.tamanhoCm ? String(data.tamanhoCm).trim() : null,
        valorEstimado: Number(data.valorEstimado) || 0,
        status: data.status || 'NOVO_PEDIDO',
        imagemReferenciaUrl,
      },
      include: { cliente: true },
    });

    return NextResponse.json(orcamento, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar orçamento:', err);
    return NextResponse.json({ error: 'Erro ao criar pedido de orçamento.' }, { status: 500 });
  }
}
