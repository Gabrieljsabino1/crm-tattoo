"use client";

import { useRef, useState } from 'react';
import { Upload, ImagePlus } from 'lucide-react';
import { compressImageFile } from '../../lib/compressImage';

const MAX_SIZE = 12 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export default function ImageDropzone({
  label,
  hint = 'Clique, arraste ou cole (Ctrl+V) imagens (PNG, JPG ou WEBP)',
  multiple = true,
  compact = false,
  disabled = false,
  onFilesSelected,
  onError,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  async function validateAndEmit(fileList) {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;

    const valid = [];
    for (const file of arr) {
      if (file.size > MAX_SIZE) {
        onError?.(`"${file.name}" excede 12MB.`);
        continue;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError?.(`"${file.name}" não é PNG, JPG ou WEBP.`);
        continue;
      }
      const processed = await compressImageFile(file);
      valid.push(processed);
    }

    if (valid.length > 0) {
      onFilesSelected?.(multiple ? valid : [valid[0]]);
    }
  }

  function handlePaste(e) {
    const items = Array.from(e.clipboardData?.items || []).filter((i) => i.type.startsWith('image/'));
    if (!items.length) return;
    e.preventDefault();
    e.stopPropagation();
    const files = items.map((i) => i.getAsFile()).filter(Boolean);
    validateAndEmit(files);
  }

  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-text-secondary block mb-1.5">{label}</label>
      )}
      <div
        tabIndex={0}
        onPaste={handlePaste}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) validateAndEmit(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed transition-all outline-none flex flex-col items-center justify-center text-center cursor-pointer ${
          compact ? 'py-3 px-3 gap-1' : 'py-5 px-4 gap-1.5'
        } ${
          dragOver
            ? 'border-apple-blue bg-apple-blue/10'
            : 'border-border bg-[#0D0B12] hover:border-border-hover hover:bg-[#181324]'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {compact ? (
          <ImagePlus size={18} className={dragOver ? 'text-apple-blue' : 'text-text-muted'} />
        ) : (
          <Upload size={20} className={dragOver ? 'text-apple-blue' : 'text-text-muted'} />
        )}
        <span className="text-xs font-medium text-text-secondary">
          {dragOver ? 'Solte para anexar' : hint}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          validateAndEmit(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
