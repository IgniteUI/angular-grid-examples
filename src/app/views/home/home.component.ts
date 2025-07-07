import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { IgxChipComponent, IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective, IgxTabsModule, IgxTooltipModule, THEME_TOKEN, ThemeToken, IgxIconService } from 'igniteui-angular';


interface TabInfo {
  title: string;
  theme: string;
  themeMode: string;
  content: string;
  moreLink: string;
  downloadLink: string;
}

const fileDownloadIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
  <path
    fill="black"
    d="M10.41 11.21V3.616c0-.43.167-.84.466-1.144A1.578 1.578 0 0 1 12 2c.422 0 .826.17 1.125.473.298.304.466.715.466 1.144v7.586l2.195-2.282a1.49 1.49 0 0 1 1.05-.455 1.47 1.47 0 0 1 1.06.434l.022.021c.284.294.443.689.443 1.1 0 .412-.16.807-.443 1.1l-4.81 4.972a1.496 1.496 0 0 1-1.069.454h-.084a1.47 1.47 0 0 1-1.066-.454L6.076 11.12a1.586 1.586 0 0 1-.44-1.098c0-.41.158-.805.44-1.098a1.49 1.49 0 0 1 1.05-.457 1.47 1.47 0 0 1 1.06.432l.025.025 2.199 2.284Z" />
  <path
    fill="black"
    d="M20.41 14.729a1.59 1.59 0 0 0-1.592 1.591v1.613a.886.886 0 0 1-.884.884H6.07a.892.892 0 0 1-.89-.884V16.32a1.591 1.591 0 0 0-3.181 0v1.618A4.087 4.087 0 0 0 6.066 22h11.868A4.07 4.07 0 0 0 22 17.931V16.32a1.59 1.59 0 0 0-1.59-1.591Z" />
</svg>`;

const viewMoreIcon = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <path d="M7 17L17 7" />
  <path d="M17 7H7" />
  <path d="M17 7V17" />
</svg>
`;

const fullScreenIcon = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
     stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M20 4h-6M20 4v6M4 20h6M4 20v-6"/>
</svg>
`;

@Component({
  standalone: true,
  selector: 'home-view',
  imports: [CommonModule, RouterModule, RouterLinkActive, IgxChipComponent, IgxIconComponent,
    IgxRippleDirective, IgxButtonDirective, IgxIconButtonDirective, IgxTabsModule, IgxTooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {

  constructor(
    private router: Router,
    private iconService: IgxIconService
  ) {
      this.iconService.addSvgIconFromText('file_download', fileDownloadIcon, 'custom');
      this.iconService.addSvgIconFromText('view_more', viewMoreIcon, 'custom');
      this.iconService.addSvgIconFromText('fullscreen', fullScreenIcon, 'custom');
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

  public onLinkClick(event: MouseEvent) {
    const targetHTML = event.currentTarget as HTMLAnchorElement;
    window.open(targetHTML.href, '_blank')?.focus();

    event.preventDefault();
    event.stopPropagation();
  }

  public onDownloadClick(event: MouseEvent, tabName: string) {
    const downloadLink = this.tabInfo.get(tabName)?.downloadLink;
    window.open(downloadLink, '_blank')?.focus();

    event.preventDefault();
    event.stopPropagation();
  }

  public onViewMoreClick(event: MouseEvent, tabName: string) {
    const viewMoreLink = this.tabInfo.get(tabName)?.moreLink;
    window.open(viewMoreLink, '_blank')?.focus();

    event.preventDefault();
    event.stopPropagation();
  }

  public onFullscreenClick() {
    const fullPath = this.router.url;
    const trimmedPath = '/' + fullPath.split('/').slice(2).join('/');
    console.log(trimmedPath);
    window.open(trimmedPath, '_blank');
  }
}
