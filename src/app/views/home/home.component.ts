import { ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation, Inject, PLATFORM_ID, NgZone } from '@angular/core';
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) {
    this.iconService.addSvgIconFromText('file_download', fileDownloadIcon, 'custom');
    this.iconService.addSvgIconFromText('view_more', viewMoreIcon, 'custom');
    this.iconService.addSvgIconFromText('fullscreen', fullScreenIcon, 'custom');
    this.iconService.addSvgIconFromText('exit_fullscreen', exitFullScreenIcon, 'custom');
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange); // Safari / Mac
    window.addEventListener('resize', this.onResize);

    this.updateTabsBasedOnRoute(this.router.url);
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange); // Safari / Mac
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
      downloadLink: "https://www.infragistics.com/resources/sample-applications/column-chart-sample-app-angular"
    }],
    ['charts/bar-chart', {
      title: "Bar Chart",
      theme: "Fluent",
      themeMode: 'Light',
      content: "Quickly compare frequency, count, total, or average of data in different categories",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/bar-chart",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/bar-chart-sample-app-angular"
    }],
    ['charts/line-chart', {
      title: "Line Chart",
      theme: "Bootstrap",
      themeMode: 'Light',
      content: "Show trends and perform comparative analysis of one or more quantities over a period of time",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/line-chart",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/line-chart-sample-app-angular"
    }],
    ['charts/pie-chart', {
      title: "Pie Chart",
      theme: "Indigo",
      themeMode: 'Light',
      content: "Part-to-whole chart that shows how categories (parts) of a data set add up to a total (whole) value.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/pie-chart",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/pie-chart-sample-app-angular"
    }],
    ['charts/step-chart', {
      title: "Step Chart",
      theme: "Material",
      themeMode: 'Light',
      content: "Emphasizes the amount of change over a period of time or compares multiple items at once.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/step-chart",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/step-chart-sample-app-angular"
    }],
    ['charts/polar-chart', {
      title: "Polar Chart",
      theme: "Fluent",
      themeMode: 'Light',
      content: "Emphasizes the amount of change over a period of time or compares multiple items at once.",
      moreLink: "https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/polar-chart",
      downloadLink: "https://www.infragistics.com/resources/sample-applications/polar-chart-sample-app-angular"
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

  private requestFullscreen(el: HTMLElement) {
    return (el.requestFullscreen ||
      (el as any).webkitRequestFullscreen)?.call(el);
  }

  private exitFullscreen() {
    return (document.exitFullscreen ||
      (document as any).webkitExitFullscreen)?.call(document);
  }

  private isElementFullscreen(): boolean {
    return !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
  }

  public async onToggleFullscreen(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.fullscreenElement?.nativeElement;
    if (!el) return;

    try {
      if (!this.isFullscreen) {
        await this.requestFullscreen(el);
      } else {
        await this.exitFullscreen();
      }

      this.isFullscreen = this.isElementFullscreen();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Fullscreen toggle failed', err);
    }
  }

  private checkFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (window.innerHeight === screen.height && window.innerWidth === screen.width)
    );
  }

  // Escaping fullscreen via the ESC button
  private onFullscreenChange = () => {
    this.zone.run(() => {
      this.isFullscreen = this.checkFullscreen();
      this.cdr.detectChanges();
    });
  };

  // Entering and escaping fullscreen via F11 button
  private onResize = () => {
    this.zone.run(() => {
      this.isFullscreen = this.checkFullscreen();
      this.cdr.detectChanges();
    });
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
