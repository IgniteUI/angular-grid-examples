import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { check, delivery, gitIssue, wrench } from '@igniteui/material-icons-extended';
import { CloseScrollStrategy, DefaultSortingStrategy, IgxAvatarComponent, IgxBadgeComponent, IgxButtonDirective, IgxButtonModule, IgxCardActionsComponent, IgxCardComponent, IgxCardContentDirective, IgxCardHeaderComponent, IgxCarouselComponent, IgxCellTemplateDirective, IgxColumnComponent, IgxDividerDirective, IgxGridComponent, IgxGridDetailTemplateDirective, IgxGridToolbarActionsComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxGridToolbarTitleComponent, IgxIconComponent, IgxIconService, IgxLabelDirective, IgxOverlayService, IgxSelectComponent, IgxSelectItemComponent, IgxSlideComponent, IgxTabContentComponent, IgxTabHeaderComponent, IgxTabItemComponent, IgxTabsComponent, RelativePosition, RelativePositionStrategy, SortingDirection, THEME_TOKEN, ThemeToken } from 'igniteui-angular';
import { IgxCategoryChartModule, IgxDataChartInteractivityModule, IgxLegendDynamicModule, IgxPieChartModule } from 'igniteui-angular-charts';
import CAR_PHOTO_MANIFEST from '../../assets/car_photo_manifest.json';
import CAR_IMAGES from '../../assets/car_images.json';
import VEHICLE_DETAILS from '../../assets/vehicle_details.json';
import DRIVER_CATEGORIES from '../../assets/driver_categories.json';
import { IgDataTemplate, IgxShapeDataSourceModule } from 'igniteui-angular-core';
import { IgxGeographicMapComponent, IgxGeographicMapModule, IgxGeographicSymbolSeriesComponent } from 'igniteui-angular-maps';
import { useAnimation } from '@angular/animations';
import { fadeIn, fadeOut } from 'igniteui-angular/animations';
import { DataService } from '../services/data.service';
import { Period } from '../models/period.enum';
import { DriverDetails } from '../models/driver-details.interface';
import { ChartType } from '../models/chart-type.enum';
import { VehicleDetails } from '../models/vehicle-details.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-fleet-management-grid',
  providers: [
    {
      provide: THEME_TOKEN,
      useFactory: () => {
        return new ThemeToken('material');
      },
    },
  ],
  imports: [
    CommonModule,
    IgxPieChartModule,
    IgxCategoryChartModule,
    IgxGridComponent,
    IgxColumnComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarTitleComponent,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxGridToolbarAdvancedFilteringComponent,
    IgxTabsComponent,
    IgxTabItemComponent,
    IgxTabHeaderComponent,
    IgxTabContentComponent,
    IgxGridDetailTemplateDirective,
    IgxCarouselComponent,
    IgxSlideComponent,
    IgxBadgeComponent,
    IgxCellTemplateDirective,
    IgxDividerDirective,
    IgxIconComponent,
    IgxButtonDirective,
    IgxButtonModule,
    IgxAvatarComponent,
    IgxCardComponent,
    IgxCardHeaderComponent,
    IgxCardContentDirective,
    IgxGeographicMapModule,
    IgxDataChartInteractivityModule,
    IgxShapeDataSourceModule,
    IgxCardActionsComponent,
    IgxLegendDynamicModule,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxLabelDirective
  ],
  templateUrl: './fleet-management-grid.component.html',
  styleUrl: './fleet-management-grid.component.scss'
})
export class FleetManagementGridComponent implements OnInit {

  //view children
  @ViewChild('grid', { static: true }) protected grid!: IgxGridComponent;
  @ViewChild(`locationOverlay`) private locationOverlay!: ElementRef;
  @ViewChild(`driverOverlay`) private driverOverlay!: ElementRef;
  @ViewChild("map", { static: false }) protected map!: IgxGeographicMapComponent;

  //overlay IDs
  private locationOverlayId: string | null = null;
  private driverOverlayId: string | null = null;

  //overlay toggle flags
  protected isLocationOverlayActive: boolean = false;
  protected isDriverOverlayActive: boolean = false;

  //car details for location overlay
  protected vehicleDetails: VehicleDetails = {
    vehiclePhoto: '',
    make: '',
    model: '',
    mileage: '',
    markerLocations: []
  }

  //chart periods
  protected Period = Period;
  /* protected periods = {
    costPerTypePeriod: Period.YTD,
    costPerMeterPeriod: Period.YTD,
    fuelCostPeriod: Period.YTD
  } */
  protected periods: { [vehicleId: string]: { costPerTypePeriod: Period, costPerMeterPeriod: Period, fuelCostPeriod: Period } | null } = {};

  //driver details for detail overlay
  protected driverDetails: DriverDetails = {
    name: "",
    license: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    photo: ""
  }

  protected VEHICLE_DETAILS = VEHICLE_DETAILS;
  protected DRIVER_CATEGORIES = DRIVER_CATEGORIES;

  protected isLoading = true;
  protected vehicleData$ = new BehaviorSubject<any>([]);

  constructor(
    @Inject(IgxIconService) private iconService: IgxIconService,
    @Inject(IgxOverlayService) private overlayService: IgxOverlayService,
    protected dataService: DataService,
    @Inject(ElementRef) private hostRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: string) { }

  public ngOnInit(): void {
    this.iconService.addSvgIconFromText(check.name, check.value, 'imx-icons');
    this.iconService.addSvgIconFromText(wrench.name, wrench.value, 'imx-icons');
    this.iconService.addSvgIconFromText(delivery.name, delivery.value, 'imx-icons');
    this.iconService.addSvgIconFromText(gitIssue.name, gitIssue.value, 'imx-icons');

    this.dataService.getVehiclesData();
    this.vehicleData$ = this.dataService.vehiclesRecords;
    this.vehicleData$.subscribe((data: any) => {
      if (data.length > 0) {
        this.isLoading = false;
      }
    });
    this.dataService.loadOptionalData();

    this.grid.sortingExpressions = [
      {
        dir: SortingDirection.Asc, fieldName: 'vehicleId',
        ignoreCase: true, strategy: DefaultSortingStrategy.instance()
      }
    ];
  }

  public ngOnDestroy(): void {
    if (this.locationOverlayId) {
      this.overlayService.detach(this.locationOverlayId);
      this.locationOverlayId = null;
    }
    if (this.driverOverlayId) {
      this.overlayService.detach(this.driverOverlayId);
      this.driverOverlayId = null;
    }
  }

  protected get isBrowserOnly(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  //handling for chart periods
  protected onPeriodChange(event: any, chart: string, vehicleId: string): void {
    if (!this.periods[vehicleId]) {
      this.periods[vehicleId] = {
        costPerTypePeriod: Period.YTD,
        costPerMeterPeriod: Period.YTD,
        fuelCostPeriod: Period.YTD
      };
    }

    if (chart === ChartType.CostPerType) {
      this.periods[vehicleId].costPerTypePeriod = event.newSelection.value;
    } else if (chart === ChartType.CostPerMeter) {
      this.periods[vehicleId].costPerMeterPeriod = event.newSelection.value;
    } else if (chart === ChartType.FuelCosts) {
      this.periods[vehicleId].fuelCostPeriod = event.newSelection.value;
    }

  }

  //getters for image paths
  protected getPathToLogoImage(value: string): string {
    return `cars/logos/${value}.png`;
  }

  protected getPathToCarImage(vehicleId: string): string[] {
    const carEntry = CAR_PHOTO_MANIFEST.find(car => car.id === vehicleId);

    if (!carEntry) {
      console.warn(`No vehicle found with ID: ${vehicleId}`);
      return [];
    }

    const folderName = carEntry.folder;

    const carPhotoNames = (CAR_IMAGES as Record<string, string[]>)[folderName];

    const carPathsToPhotos = carPhotoNames.map(photo => `cars/photos/${folderName}/${photo}`);

    return carPathsToPhotos;
  }

  protected getPathToDriverPhoto(cell: any) {
    return `people/${this.dataService.getDriverPhoto(cell.row.data.driverName)}.jpg`;
  }

  //overlay logic
  protected showLocationOverlay(event: MouseEvent, cell: any) {

    const vehicleId = cell.row?.cells?.find((c: any) => c.column.field === 'vehicleId')?.value;

    if (!vehicleId) {
      console.error('Vehicle ID not found in data');
      return;
    }
    const vehicle = this.vehicleData$.value?.find((v: any) => v.vehicleId === vehicleId);

    if (!vehicle) {
      console.error(`No vehicle found for ID: ${vehicleId}`);
      return;
    }
    this.vehicleDetails.vehiclePhoto = this.getPathToCarImage(vehicleId)[0];
    this.vehicleDetails.make = vehicle.make;
    this.vehicleDetails.model = vehicle.model;
    this.vehicleDetails.mileage = vehicle.details.mileage;
    this.vehicleDetails.markerLocations = [
      { latitude: parseFloat(vehicle.locationGps.split(',')[0]), longitude: parseFloat(vehicle.locationGps.split(',')[1]) },
    ];

    this.map.series.clear();
    this.addSeriesWith(this.vehicleDetails.markerLocations, "Red");
    const centerPoint = {
      left: this.vehicleDetails.markerLocations[0].longitude - 0.01,
      top: this.vehicleDetails.markerLocations[0].latitude - 0.01,
      width: 0.01,
      height: 0.01
    };
    this.map.zoomToGeographic(centerPoint);

    const overlaySettings = IgxOverlayService.createRelativeOverlaySettings(
      event.target as HTMLElement,
      RelativePosition.Before,
      RelativePositionStrategy.Auto,
    );

    overlaySettings.outlet = this.hostRef;

    overlaySettings.positionStrategy!.settings.openAnimation = useAnimation(fadeIn, { params: { duration: '500ms', fromOpacity: 0, toOpacity: 1 } });
    overlaySettings.positionStrategy!.settings.closeAnimation = useAnimation(fadeOut, { params: { duration: '500ms', fromOpacity: 1, toOpacity: 0 } });

    overlaySettings.scrollStrategy = new CloseScrollStrategy();

    if (this.locationOverlayId) {
      this.overlayService.detach(this.locationOverlayId);
    }

    this.isLocationOverlayActive = true;
    this.locationOverlayId = this.overlayService.attach(this.locationOverlay, overlaySettings);
    this.overlayService.show(this.locationOverlayId);
  }

  protected closeLocationOverlay() {
    this.isLocationOverlayActive = false;
    if (this.locationOverlayId) {
      this.overlayService.hide(this.locationOverlayId);
    }
  }

  protected showDriverOverlay(event: MouseEvent, cell: any) {

    const driverName = cell.row?.cells?.find((c: any) => c.column.field === 'driverName')?.value;

    if (!driverName) {
      console.error('Driver not found in data');
      return;
    }

    const driverDetails = this.dataService.findDriverByName(driverName);

    if (!driverDetails) {
      console.error(`No data found for driver: ${driverName}`);
      return;
    }

    this.driverDetails.name = driverDetails.name;
    this.driverDetails.license = driverDetails.license;
    this.driverDetails.address = driverDetails.address;
    this.driverDetails.city = driverDetails.city;
    this.driverDetails.phone = driverDetails.phone;
    this.driverDetails.email = driverDetails.email;
    this.driverDetails.photo = `people/${driverDetails.photo}.jpg`;

    const overlaySettings = IgxOverlayService.createRelativeOverlaySettings(
      event.target as HTMLElement,
      RelativePosition.After,
      RelativePositionStrategy.Auto,
    );

    overlaySettings.outlet = this.hostRef;

    overlaySettings.positionStrategy!.settings.openAnimation = useAnimation(fadeIn, { params: { duration: '500ms', fromOpacity: 0, toOpacity: 1 } });
    overlaySettings.positionStrategy!.settings.closeAnimation = useAnimation(fadeOut, { params: { duration: '500ms', fromOpacity: 1, toOpacity: 0 } });

    overlaySettings.scrollStrategy = new CloseScrollStrategy();

    if (this.driverOverlayId) {
      this.overlayService.detach(this.driverOverlayId);
    }

    this.isDriverOverlayActive = true;
    this.driverOverlayId = this.overlayService.attach(this.driverOverlay, overlaySettings);
    this.overlayService.show(this.driverOverlayId);
  }

  protected closeDriverOverlay() {
    this.isDriverOverlayActive = false;
    if (this.driverOverlayId) {
      this.overlayService.hide(this.driverOverlayId);
    }
  }

  protected getValueByPath(obj: any, path: string) {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : 'N/A', obj);
  }

  protected getStatusType(status: string): string {
    const types: Record<string, string> = {
      "Available": "success",
      "In Maintenance": "error",
      "Active": "info",
    };
    return types[status] || "default";
  }

  protected getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      "Available": "check",
      "In Maintenance": "wrench",
      "Active": "delivery"
    };
    return icons[status] || "info";
  }

  //util function for adding map series
  private addSeriesWith(locations: any[], brush: string) {
    const symbolSeries = new IgxGeographicSymbolSeriesComponent();
    symbolSeries.dataSource = locations;
    symbolSeries.latitudeMemberPath = "latitude";
    symbolSeries.longitudeMemberPath = "longitude";
    symbolSeries.markerBrush = "White";
    symbolSeries.markerOutline = brush;
    symbolSeries.markerTemplate = {
      measure: (measureInfo) => {
        measureInfo.width = 24;
        measureInfo.height = 24;
      },
      render: (renderInfo) => {
        const ctx = renderInfo.context;
        const x = renderInfo.xPosition;
        const y = renderInfo.yPosition;

        const img = new Image();
        img.src = 'location_pin.svg';
        img.onload = () => {
          ctx.drawImage(img, x - 12, y - 12, 32, 32);
        };
      }
    } as IgDataTemplate;
    this.map!.series.add(symbolSeries);
  }

  protected rightAlignedCellStyles = {
    'justify-content': 'flex-end',
    'display': 'flex'
  };

  protected rightAlignedHeaderStyles = {
    'text-align': 'right'
  };
}
