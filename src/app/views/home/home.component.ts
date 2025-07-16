import { ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLinkActive, RouterModule, Router } from '@angular/router';
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
  public tabs = [
    { key: 'inventory' },
    { key: 'hr-portal' },
    { key: 'finance' },
    { key: 'sales' },
    { key: 'fleet' }
  ];

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
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    window.removeEventListener('resize', this.onResize);
  }

  public tabInfo = new Map<string, TabInfo>([
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
}
