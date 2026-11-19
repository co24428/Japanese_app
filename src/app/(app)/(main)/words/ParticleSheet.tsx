"use client";
/**
 * The particle cheat sheet ("Korean bridge"): the six core particles, each
 * with its Korean equivalent, a sentence pattern, where the two languages
 * differ, and everyday examples with audio.
 * Content: src/lib/content/particles.ts.
 */
import { Formula } from "@/components/grammar/Formula";
import { ParticleChip } from "@/components/grammar/ParticleChip";
import { SentenceChunks } from "@/components/grammar/SentenceChunks";
import { usePrefs } from "@/components/PrefsProvider";
import { SpeakButton } from "@/components/SpeakButton";
import { PARTICLE_GUIDES } from "@/lib/content/particles";
import { PARTICLES } from "@/lib/grammar";

export function ParticleSheet() {
  const { showRomaji } = usePrefs();
  const endings = Object.values(PARTICLES).filter((p) => p.kind === "ending");

  return (
    <div className="space-y-5">
      {/* At-a-glance map; each chip jumps to its card. */}
      <section className="card">
        <h2 className="font-bold">Japanese particle → Korean 조사</h2>
        <p className="mt-0.5 text-sm text-muted">
          Both languages put particles after the word, in the same order. Most map one to one; the cards below show
          where they don&apos;t.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PARTICLE_GUIDES.map((guide) => {
            const info = PARTICLES[guide.particle]!;
            return (
              <a
                key={guide.particle}
                href={`#particle-${info.romaji}`}
                className="flex flex-col items-center gap-1 rounded-2xl p-2 transition-[background-color,translate] duration-150 hover:-translate-y-0.5 hover:bg-surface-2"
              >
                <ParticleChip info={info} size="lg" />
                <span className="text-xs text-muted">{info.role}</span>
              </a>
            );
          })}
        </div>
      </section>

      {PARTICLE_GUIDES.map((guide) => {
        const info = PARTICLES[guide.particle]!;
        return (
          <section
            key={guide.particle}
            id={`particle-${info.romaji}`}
            className="card scroll-mt-24 overflow-hidden p-0"
            style={{ "--hue": info.hue } as React.CSSProperties}
          >
            <header className="tint flex items-center gap-4 p-5">
              <ParticleChip info={info} size="lg" showKorean={false} />
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold">
                  <span lang="ja">{info.particle}</span> <span className="text-base font-semibold text-muted">({info.romaji})</span>
                </h2>
                <p className="ink-accent text-sm font-bold">
                  {info.role} · <span lang="ko">{info.ko}</span>
                </p>
              </div>
            </header>

            <div className="space-y-4 p-5">
              <div>
                <p className="eyebrow mb-2">Pattern</p>
                <Formula parts={guide.formula} highlight={guide.particle} />
                <p lang="ko" className="mt-2 text-sm text-muted">
                  🇰🇷 {guide.formulaKo}
                </p>
              </div>

              <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm leading-relaxed">
                <span className="font-bold">Korean bridge: </span>
                {guide.tip}
              </p>

              <div>
                <p className="eyebrow mb-2">Examples</p>
                <ul className="space-y-3">
                  {guide.examples.map((example) => (
                    <li key={example.jp} className="flex items-start gap-3 rounded-2xl border border-line p-3">
                      <SpeakButton markup={example.jp} size="sm" className="mt-1" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <SentenceChunks markup={example.jp} highlight={guide.particle} />
                        {showRomaji && <p className="text-sm text-muted">{example.romaji}</p>}
                        <p className="text-sm">
                          {example.en} <span lang="ko" className="text-muted">· {example.ko}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        );
      })}

      {/* Sentence endings, briefly. */}
      <section className="card">
        <h2 className="font-bold">Sentence endings</h2>
        <p className="mt-0.5 text-sm text-muted">
          These go at the very end and set the tone, like Korean endings. They are grey in lesson recaps.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {endings.map((info) => (
            <li key={info.particle} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              <ParticleChip info={info} size="md" />
              <span className="text-sm">{info.role}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
