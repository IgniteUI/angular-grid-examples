import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** One run of the source text, flagged if the query matched it. */
interface TextSegment {
  text: string;
  hit: boolean;
}

/**
 * Text with every occurrence of a query marked.
 *
 * `igx-grid` ships a search of its own - `findNext`/`findPrev` over
 * `IgxTextHighlightDirective` - but it highlights **default cell templates
 * only**, and every column in this sample renders through `igxCell`. Its match
 * cache is also built per *column field*, so it could never mark the company
 * name: that text comes from `company`, which the Asset column renders but does
 * not bind to.
 *
 * Marking the segments here instead keeps the highlight and the toolbar filter
 * driven by exactly the same comparison, so what lights up is precisely what
 * kept the row on screen.
 */
@Component({
  selector: 'app-highlighted-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (segment of segments(); track $index) {
    @if (segment.hit) {
      <mark class="search-hit">{{ segment.text }}</mark>
    } @else {
      <span>{{ segment.text }}</span>
    }
  }`,
})
export class HighlightedTextComponent {
  public readonly text = input.required<string>();
  public readonly query = input('');

  protected readonly segments = computed<TextSegment[]>(() => splitOnMatches(this.text(), this.query()));
}

/**
 * Splits `text` into alternating plain and matching runs.
 *
 * Case-insensitive, and it walks the string rather than building a `RegExp`,
 * so a query like `C++` or `(` is matched literally instead of throwing.
 */
export function splitOnMatches(text: string, query: string): TextSegment[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [{ text, hit: false }];
  }

  const haystack = text.toLowerCase();
  const segments: TextSegment[] = [];
  let cursor = 0;
  let match = haystack.indexOf(needle);

  while (match !== -1) {
    if (match > cursor) {
      segments.push({ text: text.slice(cursor, match), hit: false });
    }

    segments.push({ text: text.slice(match, match + needle.length), hit: true });
    cursor = match + needle.length;
    match = haystack.indexOf(needle, cursor);
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), hit: false });
  }

  return segments;
}
