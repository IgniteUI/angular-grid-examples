import { ChangeDetectionStrategy, Component, Type, ViewEncapsulation, afterNextRender, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

/**
 * The app root: the workbook's theme, and the workbook.
 *
 * The sample is loaded and built in the browser only, right after the first
 * render. The Spreadsheet package reads `window` as soon as its module is
 * evaluated, and the Spreadsheet builds its whole UI against the browser
 * document when it is constructed, so the sample's module must never be
 * evaluated on the server. A dynamic import inside `afterNextRender` keeps the
 * whole spreadsheet stack out of the server render and out of the initial
 * bundle, in development builds as well (a `@defer` block would load it
 * eagerly while hot module replacement is on). The prerendered page carries
 * the empty host, already painted in the page colour.
 */
@Component({
  selector: 'app-excel',
  imports: [NgComponentOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  /** The sample component, once its module has loaded. */
  protected readonly sample = signal<Type<unknown> | null>(null);

  constructor() {
    afterNextRender(() => {
      // `ngServerMode` is a build-time constant (`true` in the server bundle), so the server build drops
      // this import and leaves the spreadsheet stack, which the server never uses (`afterNextRender` does
      // not run there), out of its bundle. That is about a third of the server build's input.
      if (typeof ngServerMode === 'undefined' || !ngServerMode) {
        import('./excel-sample/excel-sample.component').then(
          (m) => this.sample.set(m.ExcelSampleComponent),
          // For example a stale page whose chunk is gone after a redeploy.
          (error: unknown) => console.error('Could not load the workbook sample.', error)
        );
      }
    });
  }
}
