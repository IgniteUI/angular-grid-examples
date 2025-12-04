import { Component, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { IgxTreeGridComponent } from 'igniteui-angular/grids/tree-grid';
import { IgxCellTemplateDirective, IgxColumnComponent, IgxGridToolbarActionsComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarComponent, IgxGridToolbarExporterComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxGridToolbarTitleComponent } from 'igniteui-angular/grids/core';
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { IgxPaginatorComponent } from 'igniteui-angular/paginator';
import { IgxIconComponent, IgxIconModule, IgxIconService } from 'igniteui-angular/icon';
import { IgxButtonModule, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { THEME_TOKEN, ThemeToken } from 'igniteui-angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);

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
        path: 'images/others/linkedin.svg',
        category: 'hr-icons',
      },
      {
        name: 'USA',
        path: 'images/countries/United States.svg',
        category: 'country-icons',
      },
      {
        name: 'CAN',
        path: 'images/countries/Canada.svg',
        category: 'country-icons',
      },
      {
        name: 'GBR',
        path: 'images/countries/United Kingdom.svg',
        category: 'country-icons',
      },
      {
        name: 'DEU',
        path: 'images/countries/Germany.svg',
        category: 'country-icons',
      },
      {
        name: 'FRA',
        path: 'images/countries/France.svg',
        category: 'country-icons',
      },
      {
        name: 'ESP',
        path: 'images/countries/Spain.svg',
        category: 'country-icons',
      },
      {
        name: 'ITA',
        path: 'images/countries/Italy.svg',
        category: 'country-icons',
      },
      {
        name: 'AUS',
        path: 'images/countries/Australia.svg',
        category: 'country-icons',
      },
      {
        name: 'JPN',
        path: 'images/countries/Japan.svg',
        category: 'country-icons',
      },
      {
        name: 'ARE',
        path: 'images/countries/uae.svg',
        category: 'country-icons',
      },
    ];

    if (isPlatformBrowser(this.platformId)) {
      icons.forEach((icon) => {
        this.iconService.addSvgIcon(icon.name, icon.path, icon.category);
      });
    }
  }
}
