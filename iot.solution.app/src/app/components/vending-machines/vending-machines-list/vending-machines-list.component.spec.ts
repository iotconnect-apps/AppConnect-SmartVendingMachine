import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendingMachinesListComponent } from './vending-machines-list.component';

describe('VendingMachinesListComponent', () => {
  let component: VendingMachinesListComponent;
  let fixture: ComponentFixture<VendingMachinesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendingMachinesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendingMachinesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
