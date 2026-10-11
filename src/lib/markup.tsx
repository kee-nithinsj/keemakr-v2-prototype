/** Renders the prototype's `<b>` and `**bold**` marks. Settled emphasis is weight 500. */
export function Markup({ text }: { text: string }) {
  const bits = text.split(/(<b>[\s\S]*?<\/b>|\*\*[^*]+\*\*)/g);
  return (
    <>
      {bits.map((bit, i) => {
        const tag = /^<b>([\s\S]*)<\/b>$/.exec(bit);
        if (tag) return <b key={i}>{tag[1]}</b>;
        if (bit.startsWith('**') && bit.endsWith('**')) return <b key={i}>{bit.slice(2, -2)}</b>;
        return bit;
      })}
    </>
  );
}
