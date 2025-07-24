import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnChartDemoComponent } from './column-chart-sample.component';

describe('ColumnChartDemoComponent', () => {
  let component: ColumnChartDemoComponent;
  let fixture: ComponentFixture<ColumnChartDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnChartDemoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ColumnChartDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
