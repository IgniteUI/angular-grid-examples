import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation, signal, viewChild } from '@angular/core';
import { IgxExcelModule, Workbook } from 'igniteui-angular-excel';
import { IgxSpreadsheetComponent, IgxSpreadsheetModule } from 'igniteui-angular-spreadsheet';
import { IgxSpreadsheetChartAdapterModule, SpreadsheetChartAdapter } from 'igniteui-angular-spreadsheet-chart-adapter';
import { ExcelUtility } from './excel-utility';

/**
 * Bundled with the app so the sample works offline and matches the source workbook exactly.
 * Relative to the document's base URL, so it resolves under any base href.
 */
const SAMPLE_WORKBOOK_URL = 'excel/meridian-north-retail-fy2027-budget.xlsx';

/**
 * Extra room, in 256ths of a character width, added to a table's header columns after load.
 *
 * The workbook sizes those columns to fit the header text exactly, so the AutoFilter dropdown
 * icon the Spreadsheet draws over the header cell covers part of the label - true to how Excel
 * itself renders an exactly-fit filtered column, just easy to miss there.
 */
const FILTER_ICON_PADDING = 3 * 256;

@Component({
  selector: 'app-excel-sample',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IgxExcelModule, IgxSpreadsheetModule, IgxSpreadsheetChartAdapterModule],
  templateUrl: './excel-sample.component.html',
  styleUrl: './excel-sample.component.scss',
})
export class ExcelSampleComponent implements AfterViewInit {
  private readonly spreadsheet = viewChild.required<IgxSpreadsheetComponent>('spreadsheet');

  protected readonly statusMessage = signal('');

  public ngAfterViewInit(): void {
    this.spreadsheet().chartAdapter = new SpreadsheetChartAdapter();

    ExcelUtility.loadFromUrl(SAMPLE_WORKBOOK_URL).then(
      (workbook) => this.setWorkbook(workbook),
      (error: unknown) => {
        console.error('Could not load the sample workbook.', error);
        this.statusMessage.set('Could not load the sample workbook.');
      },
    );
  }

  /**
   * The spreadsheet sizes its cell area from the container's measured pixels, and its own size
   * watcher re-measures only when the container's size changes - `containerResized()` is its
   * documented hook for "the size changed, look again", which is exactly what setting a freshly
   * loaded workbook amounts to here.
   */
  private setWorkbook(workbook: Workbook): void {
    this.widenFilterableColumns(workbook);

    const spreadsheet = this.spreadsheet();
    spreadsheet.workbook = workbook;
    spreadsheet.containerResized();
  }

  private widenFilterableColumns(workbook: Workbook): void {
    for (const worksheet of workbook.worksheets()) {
      for (const table of worksheet.tables()) {
        const header = table.headerRowRegion;
        for (let col = header.firstColumn; col <= header.lastColumn; col++) {
          const column = worksheet.columns(col);
          column.autoFitWidth();
          column.width = column.width + FILTER_ICON_PADDING;
        }
      }
    }
  }
}
