import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolarChartDemoComponent } from './polar-chart-sample.component';

describe('ErpHGridSampleComponent', () => {
  let component: PolarChartDemoComponent;
  let fixture: ComponentFixture<PolarChartDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarChartDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolarChartDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
