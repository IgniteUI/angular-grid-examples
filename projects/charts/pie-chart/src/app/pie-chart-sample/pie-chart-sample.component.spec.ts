import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChartDemoComponent } from './pie-chart-sample.component';

describe('ErpHGridSampleComponent', () => {
  let component: PieChartDemoComponent;
  let fixture: ComponentFixture<PieChartDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieChartDemoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PieChartDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
