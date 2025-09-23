import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const VEHICLE_DATA_URL =
  'https://www.infragistics.com/grid-examples-data/data/fleet/vehicles.json';
const DRIVERS_DATA_URL =
  'https://www.infragistics.com/grid-examples-data/data/fleet/drivers.json';
const COST_DATA_URL =
  'https://www.infragistics.com/grid-examples-data/data/fleet/cost.json';
const MAINTENANCE_DATA_URL =
  'https://www.infragistics.com/grid-examples-data/data/fleet/maintenance.json';
const UTILIZATION_DATA_URL =
  'https://www.infragistics.com/grid-examples-data/data/fleet/utilization.json';
const TRIP_HISTORY_DATA_URL =
  'https://www.infragistics.com/grid-examples-data/data/fleet/trip_history.json';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public vehiclesRecords: BehaviorSubject<any>;
  private driverRecords: BehaviorSubject<any>;
  private tripHistoryRecords: BehaviorSubject<any>;
  private mainTenanceRecords: BehaviorSubject<any>;
  private costRecords: BehaviorSubject<any>;
  private utilizationRecords: BehaviorSubject<any>;

  private fuelCostsCache: { [key: string]: any[] } = {};

  constructor(private http: HttpClient) {
    this.vehiclesRecords = new BehaviorSubject([]);
    this.driverRecords = new BehaviorSubject([]);
    this.tripHistoryRecords = new BehaviorSubject([]);
    this.mainTenanceRecords = new BehaviorSubject([]);
    this.costRecords = new BehaviorSubject([]);
    this.utilizationRecords = new BehaviorSubject([]);
  }

  public getVehiclesData() {
    this.http.get(VEHICLE_DATA_URL).subscribe((data: any) => {
      this.vehiclesRecords.next(data);
    });
  }

  public getDriverData() {
    this.http.get(DRIVERS_DATA_URL).subscribe((data: any) => {
      this.driverRecords.next(data);
    });
  }

  public getTripHistoryData() {
    this.http.get(TRIP_HISTORY_DATA_URL).subscribe((data: any) => {
      this.tripHistoryRecords.next(data);
    });
  }

  public getMaintenanceData() {
    this.http.get(MAINTENANCE_DATA_URL).subscribe((data: any) => {
      this.mainTenanceRecords.next(data);
    });
  }

  public getCostData() {
    this.http.get(COST_DATA_URL).subscribe((data: any) => {
      this.costRecords.next(data);
    });
  }

  public getUtilizationData() {
    this.http.get(UTILIZATION_DATA_URL).subscribe((data: any) => {
      data.forEach((vehicle: any) => {
        (vehicle.utilization as any).__dataIntents = {
          "'2023'": ['SeriesTitle/2023'],
          "'2024'": ['SeriesTitle/2024'],
        };
      });
      this.utilizationRecords.next(data);
    });
  }

  public loadOptionalData() {
    this.getDriverData();
    this.getTripHistoryData();
    this.getMaintenanceData();
    this.getCostData();
    this.getUtilizationData();
  }

  public findDriverByName(driverName: string) {
    return this.driverRecords.value?.find(
      (data: any) => data.name == driverName
    );
  }

  public getDriverPhoto(driverName: string) {
    return this.findDriverByName(driverName)?.photo;
  }

  public findTripHistoryById(vehicleId: string) {
    return this.tripHistoryRecords.value?.find(
      (data: any) => data.vehicleId === vehicleId
    )?.tripHistory;
  }

  public findMaintenanceDataById(vehicleId: string) {
    return this.mainTenanceRecords.value?.find(
      (data: any) => data.vehicleId === vehicleId
    )?.maintenance;
  }

  public findCostsPerTypeData(vehicleId: string, period: any) {
    const dataItem = this.costRecords.value?.find(
      (data: any) => data.vehicleId === vehicleId
    ) as any;
    const costPerTypeData = dataItem.costPerType;

    return costPerTypeData[period];
  }

  public findCostsPerMeterData(vehicleId: string, period: any) {
    const dataItem = this.costRecords.value?.find(
      (data: any) => data.vehicleId === vehicleId
    ) as any;
    const costPerMeterData = dataItem.costsPerMeterPerQuarter;

    return costPerMeterData[period];
  }

  public getFuelCostsData(vehicleId: string, period: any) {
    const dataItem = this.costRecords.value?.find(
      (data: any) => data.vehicleId === vehicleId
    ) as any;
    const fuelCostsPerMonth = dataItem.fuelCostsPerMonth;

    if (this.fuelCostsCache[vehicleId + period]) {
      return this.fuelCostsCache[vehicleId + period];
    }

    let fuelCostsPerMonthPeriod: any[];

    switch (period) {
      case 'ytd':
      case '12months':
        fuelCostsPerMonthPeriod = fuelCostsPerMonth;
        break;
      case '6months':
        fuelCostsPerMonthPeriod = [...fuelCostsPerMonth].splice(-6);
        break;
      case '3months':
        fuelCostsPerMonthPeriod = [...fuelCostsPerMonth].splice(-3);
        break;
      default:
        console.warn('Invalid period:', period);
        return [];
    }

    this.fuelCostsCache[vehicleId + period] = fuelCostsPerMonthPeriod;

    return fuelCostsPerMonthPeriod;
  }

  public findUtilizationDataById(vehicleId: string) {
    const dataItem = this.utilizationRecords.value?.find(
      (data: any) => data.vehicleId === vehicleId
    );
    return dataItem ? dataItem.utilization : [];
  }
}
