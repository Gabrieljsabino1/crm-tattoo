import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/server/prisma';
import { requireAuth, fileToDataUrl } from '../../../../../lib/server/auth';

export const dynamic = 'force-dynamic';

const includeAgendamento = {
  cliente: true,
  tatuador: { select: { id: true, nome: true, especialidade: true } },
  imagens: { orderBy: { createdAt: 'asc' } },
};

export async function POST(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  try {
    const existing = await prisma.agendamento.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    const formData = await request.formData();
    const tipoRaw = String(formData.get('tipo') || 'REFERENCIA').toUpperCase();
    const validTipo = ['REFERENCIA', 'ESBOCO', 'RESULTADO'].includes(tipoRaw)
      ? tipoRaw
      : 'REFERENCIA';
    const legendaRaw = formData.get('legenda');
    const legenda = legendaRaw ? String(legendaRaw).trim() : null;

    const files = formData.getAll('imagens').filter((f) => f && typeof f.arrayBuffer === 'function');
    if (!files.length) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 });
    }

    const created = [];
    for (const file of files) {
      const dataUrl = await fileToDataUrl(file);
      const img = await prisma.imagemAgendamento.create({
        data: {
          agendamentoId: params.id,
          tipo: validTipo,
          url: dataUrl,
          legenda,
        },
      });
      created.push(img);
    }

    const updated = await prisma.agendamento.findUnique({
      where: { id: params.id },
      include: includeAgendamento,
    });

    return NextResponse.json({ imagensAdicionadas: created, agendamento: updated }, { status: 201 });
  } catch (err) {
    console.error('Erro ao enviar imagens:', err);
    return NextResponse.json({ error: 'Erro ao salvar imagens do agendamento.' }, { status: 500 });
  }
}
