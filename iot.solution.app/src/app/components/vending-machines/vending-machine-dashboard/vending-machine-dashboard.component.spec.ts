import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendingMachineDashboardComponent } from './vending-machine-dashboard.component';

describe('VendingMachineDashboardComponent', () => {
  let component: VendingMachineDashboardComponent;
  let fixture: ComponentFixture<VendingMachineDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendingMachineDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendingMachineDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
