'use client';

import { useRef, useEffect, useState } from 'react';
import { TamaState, SPECIES_NAME, STAGE_LABEL } from '@/components/tama/types';
import { drawScene } from '@/components/tama/sprites';

function getFedCount(): number {
  try {
    const raw = localStorage.getItem('tama_fed');
    return raw ? JSON.parse(raw).length : 0;
  } catch { return 0; }
}

function ageDays(pet: TamaState): number {
  return Math.max(1, Math.round(pet.ageMs / (24 * 60 * 60_000)));
}

interface Props {
  pet: TamaState;
  onClose: () => void;
}

export default function PetShareCard({ pet, onClose }: Props) {
  const lcdRef   = useRef<HTMLCanvasElement>(null);
  const cardRef  = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const fedCount = getFedCount();
  const days     = ageDays(pet);
  const speciesName = SPECIES_NAME[pet.species] ?? pet.species;
  const stageName   = STAGE_LABEL[pet.stage]   ?? pet.stage;

  // 1. Draw LCD sprite into offscreen canvas
  useEffect(() => {
    const lcd = lcdRef.current;
    if (!lcd) return;
    const ctx = lcd.getContext('2d');
    if (!ctx) return;
    lcd.width  = 128;
    lcd.height = 128;
    ctx.imageSmoothingEnabled = false;
    drawScene(ctx, {
      state:        pet,
      anim:         'idle',
      frame:        0,
      selectedMenu: -1,
      showStatus:   false,
    });
  }, [pet]);

  // 2. Composite share card once LCD sprite is ready
  useEffect(() => {
    const card = cardRef.current;
    const lcd  = lcdRef.current;
    if (!card || !lcd) return;
    const ctx = card.getContext('2d');
    if (!ctx) return;

    const W = 480, H = 200;
    card.width  = W;
    card.height = H;

    // Background
    ctx.fillStyle = '#fdf5e4';
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = '#140a05';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, W - 4, H - 4);

    // Accent bar
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#c0281c');
    grad.addColorStop(1, '#c88a14');
    ctx.fillStyle = grad;
    ctx.fillRect(14, 14, 5, H - 28);

    // LCD sprite (scaled 128→80px, centered vertically)
    ctx.imageSmoothingEnabled = false;
    const spriteSize = 80;
    const spriteX    = 28;
    const spriteY    = Math.round((H - spriteSize) / 2);
    ctx.drawImage(lcd, spriteX, spriteY, spriteSize, spriteSize);

    // LCD screen border
    ctx.strokeStyle = '#305020';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(spriteX - 1, spriteY - 1, spriteSize + 2, spriteSize + 2);

    // Name
    const tx = spriteX + spriteSize + 18;
    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(pet.name, tx, 48);

    // Species + stage badge
    ctx.fillStyle = '#e8d5a8';
    ctx.strokeStyle = '#140a05';
    ctx.lineWidth = 1.5;
    roundRect(ctx, tx, 56, 180, 22, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#5A3820';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText(`${stageName} · ${speciesName}`, tx + 8, 71);

    // Stats
    const stats = [
      { label: 'Posts fed',    value: String(fedCount) },
      { label: 'Times petted', value: String(pet.totalPets) },
      { label: 'Days alive',   value: String(days) },
      { label: 'Lifetime XP',  value: String(pet.xp) },
    ];
    ctx.font = '12px "Courier New", monospace';
    stats.forEach((s, i) => {
      const x = tx + (i % 2) * 160;
      const y = 108 + Math.floor(i / 2) * 32;
      ctx.fillStyle = '#8A6840';
      ctx.fillText(s.label, x, y);
      ctx.fillStyle = '#2C1810';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(s.value, x, y + 14);
      ctx.font = '12px "Courier New", monospace';
    });

    // Footer
    ctx.fillStyle = '#A08060';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('henry.tsai.dev/about — TamaAussie', W - 220, H - 16);
  }, [pet, fedCount, days, speciesName, stageName]);

  function handleCopy() {
    const canvas = cardRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(() => { window.open(canvas.toDataURL(), '_blank'); });
    });
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,10,5,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--warm-white)',
          border: '2px solid var(--ink)',
          borderRadius: '10px',
          boxShadow: '6px 6px 0 var(--ink)',
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          maxWidth: '520px', width: '94%',
        }}
      >
        <h3 style={{ margin: 0, fontFamily: "'Lora', serif", color: 'var(--brown-dark)', fontSize: '1.15rem' }}>
          Show off {pet.name}!
        </h3>

        {/* Offscreen LCD render — hidden, used as source for composite */}
        <canvas ref={lcdRef} style={{ display: 'none' }} />

        {/* Share card */}
        <canvas
          ref={cardRef}
          style={{
            width: '100%', height: 'auto',
            border: '1.5px solid var(--parchment)',
            borderRadius: '4px',
            imageRendering: 'pixelated',
          }}
        />

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--warm-white)', color: 'var(--brown-mid)',
              border: '2px solid var(--ink)', borderRadius: '4px',
              boxShadow: '2px 2px 0 var(--ink)',
              padding: '0.45em 1em', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'var(--jade)' : 'var(--vermilion)',
              color: 'white', border: '2px solid var(--ink)',
              borderRadius: '4px', boxShadow: '3px 3px 0 var(--ink)',
              padding: '0.45em 1.1em', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'background 0.2s',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy image'}
          </button>
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
