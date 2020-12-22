import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product/product.service';
import { NotificationService, Notification, DeviceService } from '../../../services';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { AppConstant } from '../../../app.constants';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray, AbstractControl } from '@angular/forms';
import { shelfObj } from './device-shelf';

@Component({
  selector: 'app-add-machine',
  templateUrl: './add-machine.component.html',
  styleUrls: ['./add-machine.component.css']
})
export class AddMachineComponent implements OnInit {

  moduleName: string = 'Add Vending Machine';
  buttonName: string = 'Submit';
  checkSubmitStatus = false;
  locations = [];
  isEdit = false;
  deviceGuid: any;
  deviceObject: any = {};

  shelfForm = new FormGroup({
    sequence: new FormArray([]),
    shelfID: new FormArray([]),
    pGuid: new FormArray([]),
    capacity: new FormArray([]),
  });

  get sequence(): FormArray {
    return this.shelfForm.get('sequence') as FormArray;
  }

  get shelfID(): FormArray {
    return this.shelfForm.get('shelfID') as FormArray;
  }

  get pGuid(): FormArray {
    return this.shelfForm.get('pGuid') as FormArray;
  }

  get capacity(): FormArray {
    return this.shelfForm.get('capacity') as FormArray;
  }

  addShelfField() {
    this.sequence.push(new FormControl(''));
    this.shelfID.push(new FormControl('', [Validators.required, Validators.maxLength(30)]));
    this.pGuid.push(new FormControl('', Validators.required));
    this.capacity.push(new FormControl('', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]));
  }

  matchShelfID(c: AbstractControl): { invalid: boolean } {
    if (c.get('newPassword').value !== c.get('confirmPassword').value) {
      return { invalid: true };
    }
  }

  count = 3;
  productTypes: any = [];
  companyId: any;
  mediaUrl: any;
  deviceForm: FormGroup;

  constructor(public productService: ProductService,
    public _service: DeviceService,
    private _notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public _appConstant: AppConstant,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.createFormGroup();
    for (let i = 0; i < this.count; i++) {
      this.addShelfField();
    }

    this.activatedRoute.params.subscribe(params => {
      if (params.deviceGuid != 'add') {
        this.isEdit = true;
        this.deviceObject = {
          entityGuid: '', uniqueId: '', name: '', productTypeGuid: '', deviceItems: [new shelfObj()]
        }
        this.deviceGuid = params.deviceGuid;
        this.moduleName = "Vending Machine";
        setTimeout(() => {
          this.getDeviceDetails(params.deviceGuid);
        }, 1500);
      } else {
        this.deviceObject = {
          entityGuid: '', uniqueId: '', name: '', productTypeGuid: '', deviceItems: [new shelfObj()]
        }
      }
    });
  }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companyId = currentUser.userDetail.companyId;
    this.getLocationLookup(this.companyId);
    this.getTypeLookup();
  }

  /**
  * Create Form
  * */
  createFormGroup() {
    this.deviceForm = new FormGroup({
      entityGuid: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      uniqueId: new FormControl('', [this._notificationService.ValidatorFn, Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]),
      shelfs: new FormArray([]),
    });
  }

  /**
  * 
  * @param deivceGuid
  */
  getDeviceDetails(deivceGuid) {
    this.deviceForm.get('uniqueId').disable()
    this.deviceForm.get('name').disable()
    this.shelfForm.get('shelfID').disable()
    this.shelfForm.get('capacity').disable()
    this.spinner.show();
    this._service.getDeviceDetails(deivceGuid).subscribe(response => {
      if (response.isSuccess === true) {
        this.deviceObject = response.data;
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }


  /**
  * Get Product Type Lookup
  * */
  getTypeLookup() {
    this.productTypes = [];
    this.spinner.show();
    this.productService.getProductType('producttype').
      subscribe(response => {
        if (response.isSuccess === true) {
          this.productTypes = response['data'];
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
 * Get Location Lookup
 * */
  getLocationLookup(companyId) {
    this.locations = [];
    this.spinner.show();
    this._service.getLocationlookup(companyId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.locations = response['data'];
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      });
  }

  /**
   * Add Vending Machine
   * */
  addDevice() {
    this.checkSubmitStatus = true;
    this.deviceForm.value.shelfs = [];
    for (let i = 0; i < this.shelfID.length; i++) {
      this.deviceForm.value.shelfs.push({ Sequence: "t" + (1 + i), ShelfID: this.shelfID.at(i).value, PGuid: this.pGuid.at(i).value, Capacity: this.capacity.at(i).value });
    }
    if (this.deviceForm.status === "VALID" && this.shelfForm.status === "VALID") {

      let successMessage = this._appConstant.msgAdded.replace("modulename", "Vending Machine");
      this.spinner.show();
      this._service.addUpdateDevice(this.deviceForm.value).subscribe(response => {
        if (response.isSuccess === true) {
          this._notificationService.add(new Notification('success', successMessage));
          this.router.navigate(['vending-machines']);
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      });
    }
  }

}
