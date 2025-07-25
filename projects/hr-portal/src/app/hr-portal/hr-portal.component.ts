import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IgxTreeGridComponent,
  IgxColumnComponent,
  IgxAvatarComponent,
  IgxPaginatorComponent,
  IgxGridToolbarComponent,
  IgxGridToolbarActionsComponent,
  IgxGridToolbarHidingComponent,
  IgxGridToolbarAdvancedFilteringComponent,
  IgxGridToolbarPinningComponent,
  IgxGridToolbarTitleComponent,
  IgxGridToolbarExporterComponent,
  IgxCellTemplateDirective,
  IgxIconComponent,
  IgxIconModule,
  IgxIconService,
  IgxIconButtonDirective,
  IgxButtonModule,
  THEME_TOKEN,
  ThemeToken,
} from 'igniteui-angular';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../services/data.service';
@Component({
  selector: 'app-hr-portal',
  templateUrl: './hr-portal.component.html',
  styleUrls: ['./hr-portal.component.scss'],
  standalone: true,
  providers: [
    {
      provide: THEME_TOKEN,
      useFactory: () => {
        return new ThemeToken('fluent');
      },
    },
  ],
  imports: [
    IgxTreeGridComponent,
    IgxColumnComponent,
    IgxAvatarComponent,
    IgxPaginatorComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarAdvancedFilteringComponent,
    IgxGridToolbarPinningComponent,
    IgxGridToolbarTitleComponent,
    IgxGridToolbarExporterComponent,
    IgxCellTemplateDirective,
    IgxIconModule,
    IgxIconComponent,
    IgxIconButtonDirective,
    IgxGridToolbarHidingComponent,
    IgxButtonModule,
    CommonModule,
  ],
})
export class HrPortalComponent implements OnInit {
  public data$: BehaviorSubject<any> = new BehaviorSubject([]);
  public isLoading = true;
  @ViewChild('treeGrid', { read: IgxTreeGridComponent, static: true })
  public treeGrid!: IgxTreeGridComponent;

  constructor(private iconService: IgxIconService, private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getData();
    this.data$ = this.dataService.records;
    this.data$.subscribe((data) => {
      if (data.length !== 0) {
        this.isLoading = false;
      }
    });
    const icons = [
      {
        name: 'linkedIn',
        path: '/images/others/linkedIn.svg',
        category: 'hr-icons',
      },
      {
        name: 'USA',
        path: '/images/countries/united-states.svg',
        category: 'country-icons',
      },
      {
        name: 'CAN',
        path: '/images/countries/canada.svg',
        category: 'country-icons',
      },
      {
        name: 'GBR',
        path: '/images/countries/united-kingdom.svg',
        category: 'country-icons',
      },
      {
        name: 'DEU',
        path: '/images/countries/germany.svg',
        category: 'country-icons',
      },
      {
        name: 'FRA',
        path: '/images/countries/france.svg',
        category: 'country-icons',
      },
      {
        name: 'ESP',
        path: '/images/countries/spain.svg',
        category: 'country-icons',
      },
      {
        name: 'ITA',
        path: '/images/countries/italy.svg',
        category: 'country-icons',
      },
      {
        name: 'AUS',
        path: '/images/countries/australia.svg',
        category: 'country-icons',
      },
      {
        name: 'JPN',
        path: '/images/countries/japan.svg',
        category: 'country-icons',
      },
      {
        name: 'ARE',
        path: '/images/countries/uae.svg',
        category: 'country-icons',
      },
    ];

    icons.forEach((icon) => {
      this.iconService.addSvgIcon(icon.name, icon.path, icon.category);
    });
  }
}
