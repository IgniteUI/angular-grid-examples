import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepChartDemoComponent } from './step-chart-sample.component';

describe('ErpHGridSampleComponent', () => {
  let component: StepChartDemoComponent;
  let fixture: ComponentFixture<StepChartDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepChartDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepChartDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
