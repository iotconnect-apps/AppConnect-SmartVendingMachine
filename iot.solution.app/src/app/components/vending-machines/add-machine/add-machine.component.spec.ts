import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMachineComponent } from './add-machine.component';

describe('AddMachineComponent', () => {
  let component: AddMachineComponent;
  let fixture: ComponentFixture<AddMachineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMachineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
