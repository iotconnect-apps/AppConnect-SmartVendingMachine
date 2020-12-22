import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HardwareListComponent } from './hardware-kit-list.component';

describe('HardwareListComponent', () => {
  let component: HardwareListComponent;
  let fixture: ComponentFixture<HardwareListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HardwareListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HardwareListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
