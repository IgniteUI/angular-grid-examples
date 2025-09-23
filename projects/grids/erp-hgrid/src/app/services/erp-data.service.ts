import { Injectable } from '@angular/core';
import { TemplateDataModel } from '../data/dataModels';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const DATA_URL =
  'https://www.infragistics.com/grid-examples-data/data/erp/products.json';

@Injectable({
  providedIn: 'root',
})
export class ErpDataService {
  public records: BehaviorSubject<TemplateDataModel[]>;
  constructor(private _http: HttpClient) {
    this.records = new BehaviorSubject<TemplateDataModel[]>([]);
  }

  public getProducts() {
    this._http.get<TemplateDataModel[]>(DATA_URL).subscribe((data: TemplateDataModel[]) => {
      this.setItemsSold(data);
      this.setTotalNetProfit(data);
      this.records.next(data);
    });
  }

  private setItemsSold(data: TemplateDataModel[]): void {
    // add itemsSold property to each record based on the data in the chart
    data.forEach((item: TemplateDataModel) => {
      const lastItemIndex = item.salesTrendData.length - 1;
      item.unitsSold = item.salesTrendData[lastItemIndex].unitsSold;
    });
  }

  private calculateTotalNetProfit(product: TemplateDataModel): number {
    const unitsSold: number = product.unitsSold || 0;
    return unitsSold * product.netPrice;
  }

  private setTotalNetProfit(data: TemplateDataModel[]): void {
    data.forEach((product: TemplateDataModel) => {
      product.totalNetProfit = this.calculateTotalNetProfit(product);
    });
  }
}
