import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConstant } from '../../../app.constants';
import { Notification, NotificationService, DeviceService, InventoryService } from '../../../services';
import { ProductService } from '../../../services/product/product.service';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.css']
})
export class AddInventoryComponent implements OnInit {

  moduleName: string = 'Add Inventory';
  buttonName: string = 'Add';
  machineNames = [{ value: 'Machine', viewValue: 'Machine' }]
  locations = [];
  productTypes = [];
  productNames = [];
  shelfIds = [];
  currentDate: Date = new Date();
  companyId: any;
  mediaUrl: any;
  inventoryForm: FormGroup;
  inventoryGuid: any;
  inventoryObject: any = {};
  isEdit = false;
  checkSubmitStatus = false;
  quantityLabel = 'Quantity';
  actionList = [{ value: 'Add', text: 'Add' }, { value: 'Subtract', text: 'Subtract' }]
  deviceId: any;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialog: MatDialog,
    public deviceService: DeviceService,
    public _appConstant: AppConstant,
    public productService: ProductService,
    public _service: InventoryService,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute, ) {
    this.createFormGroup();
    this.inventoryForm.get('capacity').disable()
    this.activatedRoute.params.subscribe(params => {
      if (params.inventoryGuid != 'add') {
        this.getInventoryDetails(params.inventoryGuid);
        this.inventoryGuid = params.inventoryGuid;
        this.moduleName = "Edit Inventory";
        this.quantityLabel = 'Available Quantity';
        this.isEdit = true;
        this.buttonName = 'Update';
        this.inventoryForm.get('updatequantity').setValidators(this.setRequired());
        this.inventoryForm.get('action').setValidators(this.setRequired());
      } else {
        this.inventoryObject = { entityGuid: '', deviceGuid: '', productGuid: '', refillDateTime: '', quantity: '', deviceItemGuid: '', guid: '', capacity: '' }
      }
    });
  }

  setRequired() {
    if (this.isEdit) {
      return [Validators.required];
    } else {
      return [];
    }
  }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companyId = currentUser.userDetail.companyId;
    this.getLocationLookup(this.companyId);
  }

  createFormGroup() {
    this.inventoryForm = this.formBuilder.group({
      entityGuid: ['', Validators.required],
      deviceGuid: ['', Validators.required],
      productTypeGuid: ['', Validators.required],
      productGuid: ['', Validators.required],
      refillDateTime: ['', Validators.required],
      capacity: [''],
      quantity: ['', Validators.required],
      updatequantity: [''],
      deviceItemGuid: ['', Validators.required],
      action: ['', Validators.required],
      isClearShelf: [false],
    }, {
      validator: this.checkCapacity
    });
  }

  checkCapacity(c: AbstractControl): { invalid: boolean, message: any } {
    if (c.get('action').value.toLowerCase() == 'add') {
      if ((c.get('updatequantity').value + c.get('quantity').value) > c.get('capacity').value) {
        return { invalid: true, message: "Quantity is more than capacity" };
      }
    }
    else if (c.get('action').value.toLowerCase() == 'subtract') {
      if ((c.get('quantity').value - c.get('updatequantity').value) < 0) {
        return { invalid: true, message: "Quantity is less than zero" };
      }
    }
    else {
      if ((c.get('quantity').value) > c.get('capacity').value) {
        return { invalid: true, message: "Quantity is more than capacity" };
      }
      else if ((c.get('quantity').value) < 0) {
        return { invalid: true, message: "Quantity is less than zero" };
      }
    }
  }

  /**
   * Get inventory details by inventoryGuid
   * @param inventoryGuid
   */
  getInventoryDetails(inventoryGuid) {
    this.spinner.show();
    this._service.getInventoryDetails(inventoryGuid).subscribe(response => {
      if (response.isSuccess === true) {
        response.data.quantity = response.data.availableQty;
        this.deviceId = response.data.deviceGuid;
        this.inventoryObject = response.data;
        if (this.inventoryObject.entityGuid) {
          this.getDeviceLookup(this.inventoryObject.entityGuid);
        }
        if (this.inventoryObject.productTypeGuid) {
          this.getProductLookup(this.inventoryObject.productTypeGuid);
        }
        if (this.inventoryObject.deviceGuid) {
          this.getProductTypeLookup(this.inventoryObject.deviceGuid);
          this.getSheflIDLookup(this.inventoryObject.productTypeGuid);
        }
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
 * Get Location Lookup by companyId
 * */
  getLocationLookup(companyId) {
    this.locations = [];
    this.spinner.show();
    this.deviceService.getLocationlookup(companyId).
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
      })
  }

  /**
 * Get Product Type Lookup
 * */
  getProductTypeLookup(deviceId) {
    if (!this.isEdit) {
      this.productTypes = [];
      this.productNames = [];
      this.shelfIds = [];
      this.inventoryForm.controls.productTypeGuid.setValue('');
      this.inventoryForm.controls.productGuid.setValue('');
      this.inventoryForm.controls.deviceItemGuid.setValue('');
      this.inventoryForm.controls.capacity.setValue('');
    }
    this.deviceId = deviceId;
    this.spinner.show();
    this._service.getProductTypeLookup(deviceId).
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
  * Get Device Lookup by entityId
  * */
  getDeviceLookup(entityId) {
    if (!this.isEdit) {
      this.machineNames = [];
      this.productNames = [];
      this.shelfIds = [];
      this.productTypes = [];
      this.inventoryForm.controls.deviceGuid.setValue('');
      this.inventoryForm.controls.productTypeGuid.setValue('');
      this.inventoryForm.controls.productGuid.setValue('');
      this.inventoryForm.controls.deviceItemGuid.setValue('');
      this.inventoryForm.controls.capacity.setValue('');
    }
    this.spinner.show();
    this.deviceService.getDeviceLookup(entityId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.machineNames = response['data'];
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
 * Get Product Lookup by productTypeId
 * */
  getProductLookup(productTypeId) {
    if (!this.isEdit) {
      this.getSheflIDLookup(productTypeId)
      this.productNames = [];
      this.inventoryForm.controls.capacity.setValue('');
    }
    this.productService.getProductLookup(productTypeId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.productNames = response['data'];
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
   * Get SheflID Lookup by productTypeId and deviceId
   * @param productTypeId
   */
  getSheflIDLookup(productTypeId) {
    if (!this.isEdit) {
      this.shelfIds = [];
    }
    //this.inventoryForm.get('capacity').setValue('');
    this._service.getSheflIDLookup(this.deviceId, productTypeId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.shelfIds = response['data'];
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
   * Get shelf capacity by shelfId
   * @param shelfId
   */
  getShelfCapacity(shelfId) {
    this.spinner.show();
    this._service.getShelfCapacity(shelfId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.inventoryForm.get('capacity').setValue(response['data']);
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
   * Manage inventory
   * */
  manageInventory(isClearShelf) {
    if (isClearShelf) {
      this.inventoryForm.get('isClearShelf').setValue(true);
    }
    this.checkSubmitStatus = true;
    if (this.isEdit) {
      this.inventoryForm.registerControl('guid', new FormControl())
      this.inventoryForm.get('guid').setValue(this.inventoryGuid);
    }
    else {
      this.inventoryForm.get('action').setValue('add');
    }
    if (this.inventoryForm.status === "VALID") {
      if (this.inventoryForm.value.updatequantity >= 0 && this.isEdit) {
        this.inventoryForm.controls['quantity'].setValue(this.inventoryForm.value.updatequantity, { emitEvent: true })
      }
      this.spinner.show();
      this._service.manageInventory(this.inventoryForm.value).subscribe(response => {

        if (response.isSuccess === true) {
          if (this.isEdit) {
            this._notificationService.add(new Notification('success', "Inventory has been updated successfully."));
          } else {
            this._notificationService.add(new Notification('success', "Inventory has been added successfully."));
          }
          this.router.navigate(['/inventory']);
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
