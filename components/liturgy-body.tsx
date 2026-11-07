import { Fragment } from 'react';
import type { LiturgyBlock } from '@/lib/cnbb-liturgy-parser';
import { cn } from '@/lib/utils';
function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}
export function LiturgyBody({ blocks }: { blocks: LiturgyBlock[] }) {
  return (
    <div className="max-w-[72ch] break-words text-base leading-8 sm:text-[1.03rem]">
      {blocks.map((block, index) =>
        block.kind === 'heading' ? (
          <h4
            key={index}
            className="mb-2 mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-primary first:mt-0"
          >
            {block.text}
          </h4>
        ) : block.kind === 'verse' ? (
          <p key={index} className="mb-3">
            {block.number && (
              <sup className="mr-1.5 select-none text-xs font-semibold text-primary/75">
                <span className="sr-only">Versículo </span>
                {block.number}
              </sup>
            )}
            <Lines lines={block.lines} />
          </p>
        ) : (
          <p
            key={index}
            className={cn(
              'mb-3',
              block.style === 'subtitle' && 'text-right italic text-muted-foreground',
              block.style === 'reference' && 'bible-ref text-sm font-medium text-primary',
            )}
          >
            <Lines lines={block.lines} />
          </p>
        ),
      )}
    </div>
  );
}
