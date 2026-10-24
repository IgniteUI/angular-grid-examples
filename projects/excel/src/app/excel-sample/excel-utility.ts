import { Workbook } from 'igniteui-angular-excel';

/** Loads {@link Workbook} instances for the Spreadsheet sample. */
export class ExcelUtility {
  public static loadFromUrl(url: string): Promise<Workbook> {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Fetching "${url}" failed with status ${response.status}.`);
        }

        return response.arrayBuffer();
      })
      .then(
        (buffer) =>
          new Promise<Workbook>((resolve, reject) => {
            Workbook.load(new Uint8Array(buffer), resolve, reject);
          }),
      );
  }
}
