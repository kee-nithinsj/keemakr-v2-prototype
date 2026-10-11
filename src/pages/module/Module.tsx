import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppBar } from '@/components/shell/Shell';
import { useShell } from '@/components/shell/shell-context';
import { Button } from '@/components/ui/Button';
import { IconChevronRight } from '@/components/ui/icons';
import { SCREENS, type Node } from '@/data/modules';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';
import { canvas, canvasLight } from '@/lib/ui';

export function Module() {
  const { dept = '', screen = '' } = useParams();
  const { theme } = useShell();
  const data = SCREENS[`${dept}/${screen}`];

  return (
    <main className={cx(canvas, 'grid grid-rows-[auto_minmax(0,1fr)] text-body')} style={theme === 'light' ? canvasLight : undefined}>
      <AppBar />
      <div className="min-h-0 overflow-auto [scrollbar-width:none]">
        {data ? (
          <div key={`${dept}/${screen}`} className="mx-auto w-full max-w-[880px] animate-rise px-12 pt-14 pb-20 max-[760px]:px-5">
            <header className="mb-6">
              <h1 className="m-0 text-greeting font-medium tracking-[-0.015em] text-ink">{data.title}</h1>
              {data.sub ? <p className="mt-1.5 mb-0 text-lead text-ink-3">{data.sub}</p> : null}
            </header>
            <div className="grid gap-10">
              {data.nodes.map((node, i) => (
                <NodeView key={i} node={node} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center text-ink-3">This screen is not available.</div>
        )}
      </div>
    </main>
  );
}

function NodeView({ node }: { node: Node }) {
  switch (node.type) {
    case 'stats':
      return <Stats items={node.items} />;
    case 'funnel':
      return <Funnel title={node.title} steps={node.steps} />;
    case 'progress':
      return <Progress title={node.title} items={node.items} />;
    case 'timeline':
      return <Timeline title={node.title} items={node.items} />;
    case 'actions':
      return (
        <div className="-mt-1 flex gap-2">
          {node.items.map((a) => (
            <Button key={a.id} to={a.to} tone={a.primary ? 'pri' : 'default'}>
              {a.label}
            </Button>
          ))}
        </div>
      );
  }
}

function Title({ children }: { children: string }) {
  return <h2 className="m-0 mb-4 text-ui font-medium text-ink-3">{children}</h2>;
}

function Stats({ items }: { items: Array<{ label: string; value: string; note?: string }> }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-8 gap-y-6">
      {items.map((s) => (
        <div key={s.label}>
          <div className="text-meta text-ink-3">{s.label}</div>
          <div className="mt-1 text-[28px] leading-[34px] font-medium tracking-[-0.015em] text-ink tabular-nums">{s.value}</div>
          {s.note ? <div className="mt-0.5 text-meta text-ink-3">{s.note}</div> : null}
        </div>
      ))}
    </div>
  );
}

function Funnel({ title, steps }: { title: string; steps: Array<{ label: string; value: number }> }) {
  const top = steps[0]?.value ?? 1;
  return (
    <section>
      <Title>{title}</Title>
      <div className="grid gap-2.5">
        {steps.map((s, i) => (
          <div key={s.label} className="grid grid-cols-[96px_minmax(0,1fr)_72px] items-center gap-4">
            <span className="text-body text-ink-2">{s.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-chip">
              <motion.span
                className={cx('block h-full rounded-full', i === steps.length - 1 ? 'bg-accent' : 'bg-ink-4')}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, (s.value / top) * 100)}%` }}
                transition={ease(700, 80 + i * 60)}
              />
            </span>
            <span className="text-right text-body text-ink tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Progress({ title, items }: { title: string; items: Array<{ label: string; meta: string; done: number; total: number; to?: string }> }) {
  return (
    <section>
      <Title>{title}</Title>
      <div className="grid gap-1">
        {items.map((it) => (
          <Link key={it.label} to={it.to ?? '#'} className="group -mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-lg px-3 py-3 hover:bg-hover">
            <span className="grid">
              <span className="text-body text-ink">{it.label}</span>
              <span className="text-meta text-ink-3">{it.meta}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-meta text-ink-3 tabular-nums">
              {it.done} of {it.total}
              <IconChevronRight size={10} className="text-ink-4 group-hover:text-ink-2" />
            </span>
            <span className="col-span-2 h-1 overflow-hidden rounded-full bg-chip">
              <span className={cx('block h-full rounded-full', it.done === it.total ? 'bg-accent' : 'bg-ask')} style={{ width: `${(it.done / it.total) * 100}%` }} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Timeline({ title, items }: { title: string; items: Array<{ text: string; at: string }> }) {
  return (
    <section>
      <Title>{title}</Title>
      <ol className="m-0 grid list-none p-0">
        {items.map((it, i) => (
          <li key={i} className="relative grid grid-cols-[16px_minmax(0,1fr)] gap-3 pb-5 last:pb-0">
            <span className="relative flex justify-center pt-[7px]">
              <i className="size-[7px] rounded-full bg-ink-4" />
              {i < items.length - 1 ? <i className="absolute top-[18px] -bottom-[14px] left-1/2 w-px -translate-x-1/2 bg-line" /> : null}
            </span>
            <span>
              <span className="block text-body text-ink">{it.text}</span>
              <span className="block text-meta text-ink-3">{it.at}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
