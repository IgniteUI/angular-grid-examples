import { Injectable, signal } from '@angular/core';
import { type FleetPaintColor, fleetPaintColor } from './fleet-car-photos';

export type FleetStatus = 'Active' | 'Available' | 'In Maintenance';

export interface FleetVehicleSpecs {
  engine: string;
  generation: string;
  year: number;
  fuelType: string;
  power: string;
  mileage: string;
  doorsSeats: string;
  cubature: string;
  transmission: string;
  msrp: string;
  tollPassId: string;
}

export interface FleetVehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  type: string;
  /**
   * Folder in `fleet-management-new/car_images.json` this vehicle's photo
   * comes from. It is also where the paint colour is read from, so the swatch
   * in the UI cannot disagree with the car in the picture - see
   * `fleet-car-photos.ts`.
   */
  photoKey: string;
  vin: string;
  status: FleetStatus;
  locationCity: string;
  locationGps: string;
  specs: FleetVehicleSpecs;
}

export type FleetCarImageCatalog = Record<string, readonly string[]>;

@Injectable({ providedIn: 'root' })
export class FleetDataService {
  public readonly vehiclePhotoBaseUrl = 'https://www.infragistics.com/angular-grid-examples/cars/photos/';
  public readonly vehicleImageCatalog = signal<FleetCarImageCatalog>({});

  /**
   * Every photo of a vehicle, in fallback order. All of them live in the one
   * pinned folder, so a broken URL swaps in another shot of the *same* car
   * rather than a different-coloured one. Empty until the catalog loads, and
   * empty for a folder the catalog does not carry - the caller shows a
   * placeholder instead of a stand-in car.
   */
  public vehiclePhotoUrls(vehicle: FleetVehicle): readonly string[] {
    const files = this.vehicleImageCatalog()[vehicle.photoKey] ?? [];
    const folderUrl = `${this.vehiclePhotoBaseUrl}${encodeURIComponent(vehicle.photoKey)}`;
    return files.map((fileName) => `${folderUrl}/${encodeURIComponent(fileName)}`);
  }

  public vehicleColor(vehicle: FleetVehicle): FleetPaintColor {
    return fleetPaintColor(vehicle.photoKey);
  }

  private readonly seedVehicles: readonly FleetVehicle[] = [
    { id: 'A00101', licensePlate: 'KVG 8850', make: 'Ford', model: 'Focus', type: 'Hatchback', photoKey: 'Ford Focus blue', vin: '1FADP3F24HL312717', status: 'Active', locationCity: 'New York, NY', locationGps: '40.743828, -74.037982', specs: { engine: '1.5 TSI', generation: 'Focus Mk4', year: 2020, fuelType: 'Gasoline', power: '150 hp', mileage: '28,140 mi', doorsSeats: '5 / 5', cubature: '1,498 cm\u00b3', transmission: 'Automatic', msrp: '$24,700', tollPassId: 'EZ-193482' } },
    { id: 'A00102', licensePlate: '5VLZ 91', make: 'Ford', model: 'Focus', type: 'Hatchback', photoKey: 'Ford Focus dark gray', vin: 'WF0KXXGCKCY565571', status: 'Active', locationCity: 'Boston, MA', locationGps: '42.352104, -71.075238', specs: { engine: '1.0 EcoBoost', generation: 'Focus Mk3', year: 2019, fuelType: 'Gasoline', power: '125 hp', mileage: '32,905 mi', doorsSeats: '5 / 5', cubature: '999 cm\u00b3', transmission: 'Manual', msrp: '$20,900', tollPassId: 'EZ-402112' } },
    { id: 'A00103', licensePlate: 'C10 EFF', make: 'VW', model: 'Passat', type: 'Station Wagon', photoKey: 'VW Passat gray', vin: '1VWZYZ33DER623111', status: 'Available', locationCity: 'Camden, NJ', locationGps: '39.926602, -75.105908', specs: { engine: '1.6 GDI', generation: 'Passat B8', year: 2021, fuelType: 'Gasoline', power: '128 hp', mileage: '18,200 mi', doorsSeats: '4 / 5', cubature: '1,591 cm\u00b3', transmission: 'Automatic', msrp: '$21,900', tollPassId: 'EZ-000000' } },
    { id: 'A00104', licensePlate: 'KUM 0269', make: 'VW', model: 'Passat', type: 'Station Wagon', photoKey: 'VW Passat black', vin: '1VWZYZ33ZWE623426', status: 'Active', locationCity: 'Philadelphia, PA', locationGps: '39.992220, -75.141041', specs: { engine: '2.0 TDI', generation: 'Passat B8', year: 2019, fuelType: 'Diesel', power: '150 hp', mileage: '35,900 mi', doorsSeats: '4 / 5', cubature: '1,968 cm\u00b3', transmission: 'Automatic', msrp: '$23,500', tollPassId: 'EZ-733492' } },
    { id: 'A00105', licensePlate: 'NJ XR2188', make: 'VW', model: 'Golf', type: 'Hatchback', photoKey: 'VW Golf', vin: 'WVWZZZAUZLW042105', status: 'Active', locationCity: 'Newark, NJ', locationGps: '40.735657, -74.172363', specs: { engine: '1.5 TSI', generation: 'Golf Mk8', year: 2022, fuelType: 'Gasoline', power: '148 hp', mileage: '16,720 mi', doorsSeats: '5 / 5', cubature: '1,498 cm\u00b3', transmission: 'Automatic', msrp: '$26,400', tollPassId: 'EZ-220511' } },
    { id: 'A00106', licensePlate: 'PA QN4731', make: 'VW', model: 'Polo', type: 'Hatchback', photoKey: 'VW Polo', vin: 'WVWZZZAWZMU018406', status: 'Available', locationCity: 'Allentown, PA', locationGps: '40.608430, -75.490183', specs: { engine: '1.0 TSI', generation: 'Polo AW', year: 2021, fuelType: 'Gasoline', power: '95 hp', mileage: '22,410 mi', doorsSeats: '5 / 5', cubature: '999 cm\u00b3', transmission: 'Manual', msrp: '$19,800', tollPassId: 'EZ-194774' } },
    { id: 'A00107', licensePlate: 'CT LB9912', make: 'Mazda', model: '3', type: 'Sedan', photoKey: 'Mazda 3', vin: 'JM1BPAML1N1527107', status: 'Active', locationCity: 'Hartford, CT', locationGps: '41.765274, -72.678776', specs: { engine: '2.5 Skyactiv-G', generation: 'BP', year: 2022, fuelType: 'Gasoline', power: '186 hp', mileage: '14,980 mi', doorsSeats: '4 / 5', cubature: '2,488 cm\u00b3', transmission: 'Automatic', msrp: '$25,650', tollPassId: 'EZ-871306' } },
    { id: 'A00108', licensePlate: 'NY UJ6409', make: 'Mazda', model: '6', type: 'Sedan', photoKey: 'Mazda 6', vin: 'JM1GL1VM9L1524108', status: 'Available', locationCity: 'Buffalo, NY', locationGps: '42.885440, -78.878372', specs: { engine: '2.5 Skyactiv-G', generation: 'GL', year: 2020, fuelType: 'Gasoline', power: '187 hp', mileage: '31,260 mi', doorsSeats: '4 / 5', cubature: '2,488 cm\u00b3', transmission: 'Automatic', msrp: '$27,300', tollPassId: 'EZ-774650' } },
    { id: 'A00109', licensePlate: 'MA BK7315', make: 'Kia', model: 'Soul', type: 'Compact SUV', photoKey: 'Kia Soul', vin: 'KNDJ23AU7N7189109', status: 'Active', locationCity: 'Lowell, MA', locationGps: '42.633425, -71.316170', specs: { engine: '2.0 MPI', generation: 'SK3', year: 2022, fuelType: 'Gasoline', power: '147 hp', mileage: '13,940 mi', doorsSeats: '5 / 5', cubature: '1,999 cm\u00b3', transmission: 'CVT', msrp: '$23,100', tollPassId: 'EZ-539102' } },
    { id: 'A00110', licensePlate: 'RI FV8820', make: 'Hyundai', model: 'Kona', type: 'SUV', photoKey: 'Hyundai Kona', vin: 'KM8K53A36NU891110', status: 'In Maintenance', locationCity: 'Warwick, RI', locationGps: '41.700101, -71.416168', specs: { engine: '2.0 MPI', generation: 'OS', year: 2021, fuelType: 'Gasoline', power: '147 hp', mileage: '27,130 mi', doorsSeats: '5 / 5', cubature: '1,999 cm\u00b3', transmission: 'Automatic', msrp: '$24,450', tollPassId: 'EZ-608992' } },
    { id: 'A00111', licensePlate: 'CT YE5513', make: 'Hyundai', model: 'ix35', type: 'SUV', photoKey: 'Hyundai ix35', vin: 'TMAJU81U8DJ271111', status: 'Available', locationCity: 'New Haven, CT', locationGps: '41.308273, -72.927879', specs: { engine: '2.0 CRDi', generation: 'LM', year: 2018, fuelType: 'Diesel', power: '136 hp', mileage: '41,380 mi', doorsSeats: '5 / 5', cubature: '1,995 cm\u00b3', transmission: 'Automatic', msrp: '$22,700', tollPassId: 'EZ-331750' } },
    { id: 'A00112', licensePlate: 'NY PK2044', make: 'Honda', model: 'Civic', type: 'Sedan', photoKey: 'Honda Civic', vin: '2HGFE2F54NH341112', status: 'Active', locationCity: 'Albany, NY', locationGps: '42.652580, -73.756233', specs: { engine: '2.0 i-VTEC', generation: 'FE', year: 2022, fuelType: 'Gasoline', power: '158 hp', mileage: '18,860 mi', doorsSeats: '4 / 5', cubature: '1,996 cm\u00b3', transmission: 'CVT', msrp: '$24,280', tollPassId: 'EZ-284512' } },
    { id: 'A00113', licensePlate: 'NJ TW6921', make: 'Toyota', model: 'Corolla', type: 'Sedan', photoKey: 'Toyota Corolla', vin: 'JTDB4MEE7NJ121113', status: 'Available', locationCity: 'Jersey City, NJ', locationGps: '40.717754, -74.043143', specs: { engine: '2.0 Dynamic Force', generation: 'E210', year: 2022, fuelType: 'Gasoline', power: '169 hp', mileage: '15,540 mi', doorsSeats: '4 / 5', cubature: '1,987 cm\u00b3', transmission: 'CVT', msrp: '$23,950', tollPassId: 'EZ-746104' } },
    { id: 'A00114', licensePlate: 'NY PU6172', make: 'Kia', model: 'Sportage', type: 'SUV', photoKey: 'Kia Sportage', vin: 'KNDPU3AF2P7014114', status: 'Available', locationCity: 'Yonkers, NY', locationGps: '40.931210, -73.898747', specs: { engine: '2.5 GDI', generation: 'Sportage NQ5', year: 2023, fuelType: 'Gasoline', power: '187 hp', mileage: '9,420 mi', doorsSeats: '5 / 5', cubature: '2,497 cm\u00b3', transmission: 'Automatic', msrp: '$29,300', tollPassId: 'EZ-163590' } },
    { id: 'A00115', licensePlate: 'PA HG3370', make: 'Toyota', model: 'RAV4', type: 'SUV', photoKey: 'Toyota RAV4 1', vin: '2T3P1RFV3NW181115', status: 'Active', locationCity: 'Reading, PA', locationGps: '40.335648, -75.926872', specs: { engine: '2.5 Dynamic Force', generation: 'RAV4 XA50', year: 2022, fuelType: 'Gasoline', power: '203 hp', mileage: '17,940 mi', doorsSeats: '5 / 5', cubature: '2,487 cm\u00b3', transmission: 'Automatic', msrp: '$32,400', tollPassId: 'EZ-921143' } },
    { id: 'A00116', licensePlate: 'MA CF7201', make: 'Toyota', model: 'RAV4', type: 'SUV', photoKey: 'Toyota RAV4 2', vin: '2T3P1RFV1NW181116', status: 'In Maintenance', locationCity: 'Cambridge, MA', locationGps: '42.366978, -71.105615', specs: { engine: '2.5 Dynamic Force', generation: 'RAV4 XA50', year: 2021, fuelType: 'Gasoline', power: '203 hp', mileage: '29,540 mi', doorsSeats: '5 / 5', cubature: '2,487 cm\u00b3', transmission: 'Automatic', msrp: '$31,850', tollPassId: 'EZ-903374' } },
    { id: 'A00117', licensePlate: 'NJ JM4258', make: 'Tesla', model: '3', type: 'Sedan', photoKey: 'Tesla 3 white 1', vin: '5YJ3E1EA4NF391117', status: 'Active', locationCity: 'Hoboken, NJ', locationGps: '40.743991, -74.032364', specs: { engine: 'Dual Motor EV', generation: 'Model 3 Highland', year: 2024, fuelType: 'Electric', power: '283 kW', mileage: '8,120 mi', doorsSeats: '4 / 5', cubature: 'N/A', transmission: 'Single-speed', msrp: '$39,990', tollPassId: 'EZ-112709' } },
    { id: 'A00118', licensePlate: 'RI DS4307', make: 'VW', model: 'Touareg', type: 'SUV', photoKey: 'VW Touareg 1', vin: '3VV2B7AX4NM091118', status: 'Available', locationCity: 'Providence, RI', locationGps: '41.824577, -71.412118', specs: { engine: '3.0 V6', generation: 'Touareg CR', year: 2022, fuelType: 'Gasoline', power: '340 hp', mileage: '14,250 mi', doorsSeats: '5 / 7', cubature: '2,995 cm\u00b3', transmission: 'Automatic', msrp: '$30,900', tollPassId: 'EZ-640125' } },
    { id: 'A00119', licensePlate: 'CT DR1542', make: 'VW', model: 'Touareg', type: 'SUV', photoKey: 'VW Touareg 2', vin: 'WVGZZZCRZND091119', status: 'Active', locationCity: 'Bridgeport, CT', locationGps: '41.179226, -73.189438', specs: { engine: '3.0 V6 TDI', generation: 'Touareg CR', year: 2021, fuelType: 'Diesel', power: '286 hp', mileage: '23,500 mi', doorsSeats: '5 / 7', cubature: '2,967 cm\u00b3', transmission: 'Automatic', msrp: '$47,900', tollPassId: 'EZ-518620' } },
    { id: 'A00120', licensePlate: 'PA MX2803', make: 'Ford', model: 'Focus', type: 'Hatchback', photoKey: 'Ford Focus dark gray', vin: 'WF0NXXGCHNML29120', status: 'Available', locationCity: 'Scranton, PA', locationGps: '41.408969, -75.662412', specs: { engine: '1.5 EcoBoost', generation: 'Focus Mk4', year: 2021, fuelType: 'Gasoline', power: '150 hp', mileage: '20,640 mi', doorsSeats: '5 / 5', cubature: '1,498 cm\u00b3', transmission: 'Automatic', msrp: '$24,900', tollPassId: 'EZ-457201' } },
    { id: 'A00121', licensePlate: 'MA QL7740', make: 'Kia', model: 'EV6', type: 'Crossover', photoKey: 'Kia EV6 gray', vin: 'KNDC34LA3N5121121', status: 'Active', locationCity: 'Springfield, MA', locationGps: '42.101483, -72.589811', specs: { engine: 'RWD EV', generation: 'EV6', year: 2023, fuelType: 'Electric', power: '168 kW', mileage: '11,390 mi', doorsSeats: '5 / 5', cubature: 'N/A', transmission: 'Single-speed', msrp: '$42,600', tollPassId: 'EZ-690144' } },
    { id: 'A00122', licensePlate: 'NY BP3006', make: 'Ford', model: 'Mustang', type: 'Coupe', photoKey: 'Ford Mustang red', vin: '1FA6P8TH1N5101122', status: 'In Maintenance', locationCity: 'Rochester, NY', locationGps: '43.156578, -77.608849', specs: { engine: '2.3 EcoBoost', generation: 'S650', year: 2024, fuelType: 'Gasoline', power: '315 hp', mileage: '6,950 mi', doorsSeats: '2 / 4', cubature: '2,261 cm\u00b3', transmission: 'Automatic', msrp: '$41,200', tollPassId: 'EZ-305609' } },
    { id: 'A00123', licensePlate: 'MA GX6243', make: 'VW', model: 'Caddy', type: 'Van', photoKey: 'VW Caddy 1', vin: 'NM0LS7E21N1561123', status: 'Active', locationCity: 'Worcester, MA', locationGps: '42.262593, -71.802293', specs: { engine: '2.0 TDI', generation: 'Caddy V', year: 2022, fuelType: 'Diesel', power: '122 hp', mileage: '19,770 mi', doorsSeats: '4 / 2', cubature: '1,968 cm\u00b3', transmission: 'Automatic', msrp: '$31,250', tollPassId: 'EZ-150763' } },
    { id: 'A00124', licensePlate: 'RI NT4184', make: 'VW', model: 'Caddy', type: 'Van', photoKey: 'VW Caddy 2', vin: 'WV1ZZZ2KZPX081124', status: 'Available', locationCity: 'Pawtucket, RI', locationGps: '41.878711, -71.382555', specs: { engine: '2.0 TDI', generation: 'Caddy V', year: 2023, fuelType: 'Diesel', power: '122 hp', mileage: '10,260 mi', doorsSeats: '4 / 2', cubature: '1,968 cm\u00b3', transmission: 'Automatic', msrp: '$32,300', tollPassId: 'EZ-722430' } },
    { id: 'A00125', licensePlate: 'CT XM6102', make: 'Toyota', model: 'Tundra', type: 'Pickup', photoKey: 'Toyota Tundra', vin: '5TFMA5DB4NX011125', status: 'Active', locationCity: 'Stamford, CT', locationGps: '41.053430, -73.538734', specs: { engine: '3.5 Twin-Turbo V6', generation: 'XK70', year: 2022, fuelType: 'Gasoline', power: '389 hp', mileage: '24,880 mi', doorsSeats: '4 / 5', cubature: '3,445 cm\u00b3', transmission: 'Automatic', msrp: '$49,500', tollPassId: 'EZ-248901' } },
    { id: 'A00126', licensePlate: 'PA CP7618', make: 'Ford', model: 'F-150', type: 'Pickup', photoKey: 'Ford F-150 blue', vin: '1FTFW1E83NFA11226', status: 'Available', locationCity: 'Erie, PA', locationGps: '42.129224, -80.085060', specs: { engine: '3.5 EcoBoost', generation: 'P702', year: 2023, fuelType: 'Gasoline', power: '400 hp', mileage: '13,500 mi', doorsSeats: '4 / 5', cubature: '3,496 cm\u00b3', transmission: 'Automatic', msrp: '$52,900', tollPassId: 'EZ-640318' } }
  ];

  /** Status is the only mutable field, so a shallow copy per vehicle is enough. */
  public readonly fleetVehicles = signal<FleetVehicle[]>(this.seedVehicles.map((vehicle) => ({ ...vehicle })));

  public setVehicleStatus(id: string, status: FleetStatus): void {
    this.fleetVehicles.update((vehicles) =>
      vehicles.map((vehicle) => (vehicle.id === id ? { ...vehicle, status } : vehicle))
    );
  }

  public resetVehicles(): void {
    this.fleetVehicles.set(this.seedVehicles.map((vehicle) => ({ ...vehicle })));
  }

  public async loadVehicleImageCatalog(): Promise<void> {
    try {
      // Relative path (no leading slash) resolves against the document's <base href>, honoring --base-href at build time.
      const response = await fetch('fleet-management-new/car_images.json');
      if (!response.ok) return;
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== 'object') return;

      const catalog: FleetCarImageCatalog = {};
      for (const [key, files] of Object.entries(payload as Record<string, unknown>)) {
        if (!Array.isArray(files)) continue;
        const validFiles = files.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
        if (validFiles.length > 0) catalog[key] = validFiles;
      }

      this.vehicleImageCatalog.set(catalog);
    } catch {
      // Use fallback image when asset load fails.
    }
  }
}
