import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms'
import { NgxSpinnerService } from 'ngx-spinner'
import { AppConstant } from "../../../../app.constants";
import { hadwareobj } from './hardware-kit-model';
import { NotificationService, DeviceService, Notification } from '../../../../services';

@Component({
  selector: 'app-hardware-add',
  templateUrl: './hardware-kit-add.component.html',
  styleUrls: ['./hardware-kit-add.component.css']
})

export class HardwareAddComponent implements OnInit {

  hardwareKits = []
  hardwareobject = new hadwareobj();
  parentdevicearry = [];
  currentUser: any;
  status;
  moduleName = "Add Hardware Kit";
  deviceObject = {};
  hardwareGuid = '';
  isEdit = false;
  deviceForm: FormGroup;
  checkSubmitStatus = false;
  templateList = [];
  dataSource: any = [];
  tagList = [];

  constructor(
    private router: Router,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private deviceService: DeviceService,
    public _appConstant: AppConstant
  ) {
    this.createFormGroup();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.activatedRoute.params.subscribe(params => {
      if (params.hardwarekitGuid != null) {
        this.hardwareGuid = params.hardwarekitGuid;
        this.getHardwarkitDetails(this.hardwareGuid);
        this.moduleName = "Edit Hardware Kit";
        this.isEdit = true;
      } else {
        this.deviceObject = {}
      }
    });
  }

  ngOnInit() {
    this.getTemplateLookup();
  }

  /**
   * Create Form deviceForm
   * */
  createFormGroup() {
    this.deviceForm = new FormGroup({
      //guid: new FormControl(null),
      kitTypeGuid: new FormControl('', [Validators.required]),
      kitCode: new FormControl('', [Validators.required, this._notificationService.ValidatorFn, Validators.pattern('^[A-Za-z0-9 ]+$')]),
      uniqueId: new FormControl('', [Validators.required, this._notificationService.ValidatorFn, Validators.pattern('^[A-Za-z0-9]+$')]),
      name: new FormControl('', [Validators.required, this._notificationService.ValidatorFn]),
      note: new FormControl('', this._notificationService.ValidatorFn),
      tag: new FormControl(''),
    });
  }

  /**
   * Get Template Lookup for Kit Type
   * */
  getTemplateLookup() {
    this.deviceService.getkittypes().subscribe(response => {
      this.templateList = response['data'];
    });
  }

  /**
   * Add/Update Hardware Kit
   * */
  manageHardwarekit() {
    this.checkSubmitStatus = true;
    this.hardwareKits = [];
    if (this.deviceForm.status === "VALID") {
      this.spinner.show();
      let successMessage = this._appConstant.msgCreated.replace("modulename", "Hardware Kit");

      if (this.isEdit && this.hardwareGuid) {
        this.hardwareKits.push({
          "guid": this.hardwareGuid
          , "kitCode": this.deviceObject['kitCode']
          , "uniqueId": this.deviceObject['uniqueId']
          , "name": this.deviceForm.value.name
          , "note": this.deviceForm.value.note
        });
        successMessage = this._appConstant.msgUpdated.replace("modulename", "Hardware Kit");
      }
      else {
        this.hardwareKits.push({
          "kitCode": this.deviceForm.value.kitCode
          , "uniqueId": this.deviceForm.value.uniqueId
          , "name": this.deviceForm.value.name
          , "note": this.deviceForm.value.note
        })
      }

      var objdata = {
        "kitTypeGuid": this.deviceForm.value.kitTypeGuid
        , "hardwareKits": this.hardwareKits
      }
      this.deviceService.addUpdateHardwarekit(objdata, this.isEdit).subscribe(response => {
        this.spinner.hide();
        if (response.isSuccess === true) {
          this.router.navigate(['/admin/hardwarekits']);
          this._notificationService.add(new Notification('success', successMessage));
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      });

    }
  }

  /**
   * Get Hardware Kit details by hardwareGuid
   * @param hardwareGuid
   */
  getHardwarkitDetails(hardwareGuid) {
    this.deviceForm.get('kitCode').disable()
    this.deviceForm.get('uniqueId').disable()
    this.deviceService.getHardwarkitDetails(hardwareGuid).subscribe(response => {
      if (response.data) {
        let kitTypeGuid = response.data.kitTypeGuid.toUpperCase();
        response.data.kitTypeGuid = kitTypeGuid;
        this.deviceObject = response.data;
      }
    });
  }

}
