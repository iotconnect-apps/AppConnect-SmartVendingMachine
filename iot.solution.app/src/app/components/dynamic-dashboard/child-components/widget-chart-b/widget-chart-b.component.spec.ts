import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetChartBComponent } from './widget-chart-b.component';

describe('WidgetChartBComponent', () => {
  let component: WidgetChartBComponent;
  let fixture: ComponentFixture<WidgetChartBComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetChartBComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetChartBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
