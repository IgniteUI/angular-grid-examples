import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ISelectionEventArgs } from 'igniteui-angular/drop-down';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IGX_LIST_DIRECTIVES } from 'igniteui-angular/list';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { NotificationsService } from '../services/notifications.service';
import { WorkspaceService } from '../services/workspace.service';
import { FINANCE_PIPES } from '../util/finance.pipes';

/** Sentinel for "no symbol filter" - `igx-select` needs a value to bind against. */
const ALL_SYMBOLS = '';

/**
 * The news wire, as a docked pane. Alerts are separate - they live in the
 * command bar's dialog, being read on arrival rather than browsed.
 */
@Component({
  selector: 'app-news-panel',
  imports: [
    IGX_LIST_DIRECTIVES,
    IGX_INPUT_GROUP_DIRECTIVES,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxIconComponent,
    FINANCE_PIPES,
  ],
  templateUrl: './news-panel.html',
  styleUrl: './news-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPanelComponent {
  private readonly notifications = inject(NotificationsService);
  private readonly workspace = inject(WorkspaceService);

  readonly allSymbols = ALL_SYMBOLS;
  /**
   * Shared rather than local: clicking a watchlist row narrows the wire too, so
   * the filter has to be reachable from outside this pane - and a reset has to
   * be able to clear it.
   */
  readonly symbolFilter = this.workspace.newsFilter;

  readonly now = this.notifications.now;

  /**
   * Only the symbols the wire is actually carrying, so the list can never offer
   * a filter that would empty the pane.
   */
  readonly wireSymbols = computed(() => {
    const symbols = new Set<string>();
    for (const article of this.notifications.news()) {
      if (article.symbol) {
        symbols.add(article.symbol);
      }
    }
    // A symbol focused from another pane may have nothing on the wire yet, and
    // without an option for it the select would render an empty box.
    const active = this.symbolFilter();
    if (active) {
      symbols.add(active);
    }

    return [...symbols].sort();
  });

  readonly articles = computed(() => {
    const symbol = this.symbolFilter();
    // `newsFor` keeps the untagged macro wire alongside the instrument - a
    // filtered desk still wants to see the Fed headline.
    return symbol ? this.notifications.newsFor(symbol) : this.notifications.news();
  });

  onFilterChange(event: ISelectionEventArgs): void {
    this.workspace.setNewsFilter(event.newSelection?.value ?? ALL_SYMBOLS);
  }

  /** Jumps the desk to the instrument a headline is about. */
  selectSymbol(symbol: string | null): void {
    if (symbol) {
      this.workspace.selectSymbol(symbol);
    }
  }
}
