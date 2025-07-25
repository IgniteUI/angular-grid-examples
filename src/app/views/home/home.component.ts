import { ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLinkActive, RouterModule, Router, NavigationEnd } from '@angular/router';
import { IgxButtonDirective, IgxIconComponent, IgxTabsModule, IgxTooltipModule, IgxIconService } from 'igniteui-angular';
import { exitFullScreenIcon, fileDownloadIcon, fullScreenIcon, viewMoreIcon } from '../../data/icons';

interface TabInfo {
  title: string;
  theme: string;
  themeMode: string;
  content: string;
  moreLink: string;
  downloadLink: string;
}

@Component({
  standalone: true,
  selector: 'home-view',
  imports: [CommonModule, RouterModule, RouterLinkActive, IgxIconComponent, IgxButtonDirective, IgxTabsModule, IgxTooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {

  @ViewChild('fullscreenElement') fullscreenElement!: ElementRef;
  public isFullscreen: boolean = false;
  public tabsGrids = [
    { key: 'inventory' },
    { key: 'hr-portal' },
    { key: 'finance' },
    { key: 'sales' },
    { key: 'fleet' }
  ];
  public tabsCharts = [
    { key: 'column-chart' },
    { key: 'bar-chart' },
    { key: 'line-chart' },
    { key: 'pie-chart' },
    { key: 'step-chart' },
    { key: 'polar-chart' }
  ];
  public isChartsSection: boolean = false;

  constructor(
    private iconService: IgxIconService,
    private cdr: ChangeDetectorRef,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
      this.iconService.addSvgIconFromText('file_download', fileDownloadIcon, 'custom');
      this.iconService.addSvgIconFromText('view_more', viewMoreIcon, 'custom');
      this.iconService.addSvgIconFromText('fullscreen', fullScreenIcon, 'custom');
      this.iconService.addSvgIconFromText('exit_fullscreen', exitFullScreenIcon, 'custom');
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    window.addEventListener('resize', this.onResize);

    this.updateTabsBasedOnRoute(this.router.url);
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    window.removeEventListener('resize', this.onResize);
  }

  public tabInfoGrids = new Map<string, TabInfo>([
    ['inventory', {
      title: "ERP/Inventory",
      theme: "Material",
      themeMode: 'Light',
      content: "Tracking and managing quantity, location and details of products in stock.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/hierarchical-grid",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/erp-inventory-sample-app"
    }],
    ['hr-portal', {
      title: "Org Chart/HR Portal",
      theme: "Fluent",
      themeMode: 'Light',
      content: "Displaying company's hierarchical structure and showing employees data.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/tree-grid",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/org-charthr-portal-sample-app"
    }],
    ['finance', {
      title: "Financial Portfolio",
      theme: "Bootstrap",
      themeMode: 'Light',
      content: "Asset tracking, profit and loss analysis, featuring interactive dynamic charts.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/financial-portfolio-sample-app"
    }],
    ['sales', {
      title: "Sales Dashboard",
      theme: "Indigo",
      themeMode: 'Light',
      content: "For trend analysis, KPIs and viewing sales summaries by region, product, etc.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/pivotGrid/pivot-grid",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/sales-grid-sample-app"
    }],
    ['fleet', {
      title: "Fleet Management",
      theme: "Material",
      themeMode: 'Dark',
      content: "A master-detail grid for managing vehicle acquisition, operations, and maintenance.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/master-detail",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/fleet-management-sample-app"
    }],
  ]);

  public tabInfoCharts = new Map<string, TabInfo>([
    ['charts/column-chart', {
      title: "Column Chart",
      theme: "Material",
      themeMode: 'Light',
      content: "Render a collection of data points connected by a straight line to emphasize the amount of change over a period of time",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/column-chart",
      downloadLink: ""
    }],
    ['charts/bar-chart', {
      title: "Bar Chart",
      theme: "Fluent",
      themeMode: 'Light',
      content: "Quickly compare frequency, count, total, or average of data in different categories",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/bar-chart",
      downloadLink: ""
    }],
    ['charts/line-chart', {
      title: "Line Chart",
      theme: "Bootstrap",
      themeMode: 'Light',
      content: "Show trends and perform comparative analysis of one or more quantities over a period of time",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/line-chart",
      downloadLink: ""
    }],
    ['charts/pie-chart', {
      title: "Pie Chart",
      theme: "Indigo",
      themeMode: 'Light',
      content: "Part-to-whole chart that shows how categories (parts) of a data set add up to a total (whole) value.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/pie-chart",
      downloadLink: ""
    }],
    ['charts/step-chart', {
      title: "Step Chart",
      theme: "Material",
      themeMode: 'Light',
      content: "Emphasizes the amount of change over a period of time or compares multiple items at once.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/step-chart",
      downloadLink: ""
    }],
    ['charts/polar-chart', {
      title: "Polar Chart",
      theme: "Fluent",
      themeMode: 'Light',
      content: "Emphasizes the amount of change over a period of time or compares multiple items at once.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/polar-chart",
      downloadLink: ""
    }],
  ]);

  public tabInfo = this.tabInfoGrids;
  public activeTabs = this.tabsGrids;

  public onDownloadClick(event: MouseEvent, tabName: string) {
    event.preventDefault();
    event.stopPropagation();

    const downloadLink = this.tabInfo.get(tabName)?.downloadLink;

    if (isPlatformBrowser(this.platformId) && downloadLink) {
      window.open(downloadLink, '_blank')?.focus();
    }
  }

  public onViewMoreClick(event: MouseEvent, tabName: string) {
    event.preventDefault();
    event.stopPropagation();

    const viewMoreLink = this.tabInfo.get(tabName)?.moreLink;

    if (isPlatformBrowser(this.platformId) && viewMoreLink) {
      window.open(viewMoreLink, '_blank')?.focus();
    }
  }

  public async onToggleFullscreen(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.fullscreenElement?.nativeElement;

    if (!document.fullscreenElement && el?.requestFullscreen) {
      await el.requestFullscreen();
      this.isFullscreen = true;
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  // Escaping fullscreen via the ESC button
  private onFullscreenChange = () => {
    this.isFullscreen = !!document.fullscreenElement;
    this.cdr.detectChanges();
  };

  // Entering and escaping fullscreen via F11 button
  private onResize = () => {
    const isFullscreen = window.innerWidth === screen.width && window.innerHeight === screen.height;
    if (this.isFullscreen !== isFullscreen) {
      this.isFullscreen = isFullscreen;
      this.cdr.detectChanges();
    }
  };

  private updateTabsBasedOnRoute(url: string) {
    if (url.includes('charts')) {
      this.tabInfo = this.tabInfoCharts;
      this.activeTabs = this.tabsCharts;
      this.isChartsSection = true;
    } else {
      this.tabInfo = this.tabInfoGrids;
      this.activeTabs = this.tabsGrids;
      this.isChartsSection = false;
    }
  }
}
