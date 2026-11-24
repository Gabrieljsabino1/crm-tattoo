"use client";

import { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { TIPO_IMAGEM_LABEL } from '../../lib/tattooConstants';
import { resolveImageUrl } from '../../services/api';

export default function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [image, onClose]);

  if (!image) return null;

  const src = resolveImageUrl(image.url);

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl flex items-center justify-between mb-3 px-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          {image.tipo && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-apple-blue/20 text-apple-blue border border-apple-blue/30">
              {TIPO_IMAGEM_LABEL[image.tipo] || image.tipo}
            </span>
          )}
          {image.legenda && <span className="text-xs text-text-secondary">{image.legenda}</span>}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
            title="Abrir / Baixar imagem"
          >
            <Download size={16} />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
            title="Fechar (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div
        className="max-w-4xl max-h-[82vh] w-full flex items-center justify-center rounded-2xl overflow-hidden bg-[#0D0B12] border border-border p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={image.legenda || 'Tattoo'}
          className="max-h-[78vh] max-w-full object-contain rounded-xl"
        />
      </div>
    </div>
  );
}
