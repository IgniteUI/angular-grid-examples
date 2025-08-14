import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const DATA_URL = 'https://www.infragistics.com/grid-examples-data/data/sales/sales.json';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public records: BehaviorSubject<any>;
  constructor(private _http: HttpClient) {
    this.records = new BehaviorSubject([]);
  }

  public getData() {
    this._http.get(DATA_URL, { responseType: 'json' }).subscribe((data: any) => {
      this.records.next(data);
    });
  }
}
