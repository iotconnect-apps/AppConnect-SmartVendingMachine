import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms'
import { NgxSpinnerService } from 'ngx-spinner'
import { Notification, NotificationService, LocationService } from '../../../services';
import { AppConstant, MessageAlertDataModel, DeleteAlertDataModel } from '../../../app.constants';
import { MatDialog } from '@angular/material';
import { MessageDialogComponent, DeleteDialogComponent } from '../..';

export interface DeviceTypeList {
  id: number;
  type: string;
}

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.css']
})
export class AddLocationComponent implements OnInit {

  @ViewChild('myFile', { static: false }) myFile: ElementRef;
  validstatus = false;
  handleImgInput = false;
  MessageAlertDataModel: MessageAlertDataModel;
  deleteAlertDataModel: DeleteAlertDataModel;
  currentImage: any;
  fileUrl: any;
  fileName = '';
  fileToUpload: any;
  hasImage = false;
  status;
  moduleName = "Add Location";
  locationObject: any = {};
  locationGuid = '';
  isEdit = false;
  locationForm: FormGroup;
  checkSubmitStatus = false;
  countryList = [];
  stateList = [];
  mediaUrl: any;
  buttonname = 'Submit'
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public locationService: LocationService,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
  ) {
    this.createFormGroup();
    this.activatedRoute.params.subscribe(params => {
      if (params.locationGuid != null && params.locationGuid != 'add') {
        this.isEdit = true;
        this.locationGuid = params.locationGuid;
        this.moduleName = "Edit Location";
        this.buttonname = 'Update'
        setTimeout(() => {
          this.getLocationDetails(params.locationGuid);
        }, 1500);
        this.getcountryList();
      } else {
        this.getcountryList();
        this.locationObject = { name: '', zipcode: '', countryGuid: '', stateGuid: '', isActive: 'true', city: '', latitude: '', longitude: '' }
      }
    });
  }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;

  }

  /**
   * Remove image
   * */
  imageRemove() {
    this.myFile.nativeElement.value = "";
    if (this.locationObject['image'] == this.currentImage) {
      this.locationForm.get('imageFile').setValue('');
      if (!this.handleImgInput) {
        this.handleImgInput = false;
        this.deleteImgModel();
      }
      else {
        this.handleImgInput = false;
      }
    }
    else {
      if (this.currentImage) {
        this.spinner.hide();
        this.locationObject['image'] = this.currentImage;
        this.fileToUpload = false;
        this.fileName = '';
        this.fileUrl = null;
      }
      else {
        this.spinner.hide();
        this.locationObject['image'] = null;
        this.locationForm.get('imageFile').setValue('');
        this.fileToUpload = false;
        this.fileName = '';
        this.fileUrl = null;
      }
    }
  }

  /**
   * Delete image confirmation popup
   * */
  deleteImgModel() {
    this.deleteAlertDataModel = {
      title: "Delete Image",
      message: this._appConstant.msgConfirm.replace('modulename', "Location Image"),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletelocationImg();
      }
    });
  }

  /**
   * Delete location image
   * */
  deletelocationImg() {
    this.spinner.show();
    this.locationService.removeLocationImage(this.locationGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.currentImage = '';
        this.locationObject['image'] = null;
        this.locationForm.get('imageFile').setValue('');
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Location Image")));
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Create form
   * */
  createFormGroup() {
    this.locationForm = this.formBuilder.group({
      parentEntityGuid: [''],
      countryGuid: ['', Validators.required],
      stateGuid: ['', Validators.required],
      city: ['', [this._notificationService.ValidatorFn, Validators.required]],
      name: ['', [this._notificationService.ValidatorFn, Validators.required]],
      zipcode: ['', [this._notificationService.ValidatorFn, Validators.required, Validators.pattern('^[A-Z0-9 _]*$')]],
      description: [''],
      address: ['', [this._notificationService.ValidatorFn, Validators.required]],
      isActive: ['', [Validators.required]],
      guid: null,
      latitude: ['', [Validators.required, Validators.pattern('^(\\+|-)?(?:90(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,6})?))$')]],
      longitude: ['', [Validators.required, Validators.pattern('^(\\+|-)?(?:180(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,6})?))$')]],
      imageFile: [''],
    });
  }

  /**
   * Manage Location details
   * */
  addLocation() {
    this.checkSubmitStatus = true;

    if (this.isEdit) {
      this.locationForm.get('guid').setValue(this.locationGuid);
      this.locationForm.get('isActive').setValue(this.locationObject['isActive']);
    } else {
      this.locationForm.get('isActive').setValue(true);
    }
    if (this.locationForm.status === "VALID") {
      if (this.validstatus == true || !this.locationForm.value.imageFile) {
        if (this.fileToUpload) {
          this.locationForm.get('imageFile').setValue(this.fileToUpload);
        }
        this.spinner.show();
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.locationForm.get('parentEntityGuid').setValue(currentUser.userDetail.entityGuid);

        this.locationService.addLocation(this.locationForm.value).subscribe(response => {
          this.spinner.hide();
          if (response.isSuccess === true) {
            if (this.isEdit) {
              this._notificationService.add(new Notification('success', "Location has been updated successfully."));
            } else {
              this._notificationService.add(new Notification('success', "Location has been added successfully."));
            }
            this.router.navigate(['/locations']);
          } else {
            this._notificationService.add(new Notification('error', response.message));
          }
        });
      } else {
        this.MessageAlertDataModel = {
          title: "Location Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MessageAlertDataModel,
          disableClose: false
        });
      }
    }
  }

  /**
   * Remove file
   * @param type
   */
  removeFile(type) {
    if (type === 'image') {
      this.fileUrl = '';
      //this.floor_image_Ref.nativeElement.value = '';
    }
  }

  /**
   * Handle image type
   * @param event
   */
  handleImageInput(event) {
    this.handleImgInput = true;
    let files = event.target.files;
    var that = this;
    if (files.length) {
      let fileType = files.item(0).name.split('.');
      let imagesTypes = ['jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
        this.validstatus = true;
        this.fileName = files.item(0).name;
        this.fileToUpload = files.item(0);
        if (event.target.files && event.target.files[0]) {
          var reader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (innerEvent: any) => {
            this.fileUrl = innerEvent.target.result;
            that.locationObject.image = this.fileUrl;
          }
        }
      } else {
        this.imageRemove();
        this.MessageAlertDataModel = {
          title: "Location Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MessageAlertDataModel,
          disableClose: false
        });
      }
    }


  }

  /**
   * 
   * @param locationGuid
   */
  getLocationDetails(locationGuid) {
    this.spinner.show();
    this.locationService.getLocatinDetails(locationGuid).subscribe(response => {
      if (response.isSuccess === true) {
        this.locationObject = response.data;
        if (this.locationObject.image) {
          this.locationObject.image = this.mediaUrl + this.locationObject.image;
          this.currentImage = this.locationObject.image;
          this.hasImage = true;
        } else {
          this.hasImage = false;
        }
        this.locationService.getstatelist(response.data.countryGuid).subscribe(response => {
          this.stateList = response.data;
          this.spinner.hide();
        });
      }
    });
  }

  /**
   * Get country list
   * */
  getcountryList() {
    //if (!this.isEdit) {
    this.spinner.show();
    //}
    this.locationService.getcountryList().subscribe(response => {

      if (!this.isEdit) {
        this.spinner.hide();
      }
      this.countryList = response.data;
    });
  }

  /**
   * Get state list by country guid
   * @param event
   */
  changeCountry(event) {
    this.locationForm.controls['stateGuid'].setValue(null, { emitEvent: true })
    if (event) {
      let id = event.value;
      this.spinner.show();
      this.locationService.getstatelist(id).subscribe(response => {
        this.spinner.hide();
        this.stateList = response.data;
      });
    }
  }

  /**
   * Get data in lowecase
   * @param val
   */
  getdata(val) {
    return val = val.toLowerCase();
  }

}

