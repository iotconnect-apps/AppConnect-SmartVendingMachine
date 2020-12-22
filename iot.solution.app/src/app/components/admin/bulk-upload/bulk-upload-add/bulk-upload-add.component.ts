import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { NgxSpinnerService } from 'ngx-spinner'
import { DeviceService, NotificationService } from 'app/services';
import { Notification } from 'app/services/notification/notification.service';
import { AppConstant, MessageAlertDataModel } from "../../../../app.constants";
import { Guid } from "guid-typescript";
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { saveAs } from 'file-saver';
import { MessageDialogComponent } from '../../../../components/common/message-dialog/message-dialog.component';
import { MatDialog } from '@angular/material';
export interface DeviceTypeList {
  id: number;
  type: string;
}
export interface deviceobj {
  deviceid: any;
}
@Component({
  selector: 'app-bulkupload-add',
  templateUrl: './bulk-upload-add.component.html',
  styleUrls: ['./bulk-upload-add.component.css']
})


export class BulkuploadAddComponent implements OnInit {
  MessageAlertDataModel: MessageAlertDataModel;
  @ViewChild('kit_list_Ref', { static: false }) kit_list_Ref: ElementRef;
  tblshow = false;
  formshow = false;
  IsForUpdate = false;
  kitDevices = [];
  parentdevicearry = [];
  deviceobj = {};
  currentUser: any;
  fileUrl: any;
  fileName = '';
  fileToUpload: any = null;
  status;
  moduleName = "Bulk Upload";
  deviceObject = {};
  hardwareGuid = '';
  isEdit = false;
  bulkForm: FormGroup;
  checkSubmitStatus = false;
  buildingList = [];
  selectedBuilding = '';
  floorList = [];
  spaceList = [];
  templateList = [];
  dataSource: any = [];
  displayedColumns: string[] = ['kitCode', 'uniqueId', 'name', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('fileupload', null) fileUpload: ElementRef;
  index: any = -1;
  parentDeviceGuids: string;
  jsonadata: any;
  dataobj: any;
  responseobj: any;
  validstatus = false;
  constructor(
    private router: Router,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private deviceService: DeviceService,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
  ) {
    this.createFormGroup();
  }

  ngOnInit() {
    this.gettemplateLookup();
  }

  /**
   * Download sample file
   * */
  download() {
    this.deviceService.getHardwarkitDownload().subscribe(response => {
      var myJSON = JSON.stringify(response);
      saveAs(new Blob([myJSON], { type: "json" }), 'data.json');
    });
  }

  /**
   * Create form group
   * */
  createFormGroup() {
    this.bulkForm = new FormGroup({
      kit_list: new FormControl('', [Validators.required]),
      kitTypeGuid: new FormControl('', [Validators.required]),
    });
  }

  /**
   * Bulk upload the file
   * */
  uploadbulk() {
    this.checkSubmitStatus = true;
    if (this.bulkForm.status === "VALID") {
      if (this.validstatus == true) {
        this.spinner.show();
        this.jsonadata = { "kitTypeGuid": this.bulkForm.value.kitTypeGuid, "hardwareKits": this.dataobj }
        this.deviceService.uploadFile(this.jsonadata).subscribe(response => {
          this.spinner.hide();
          if (response.isSuccess === true) {
            this.responseobj = response.data;
            this.dataSource = new MatTableDataSource(response.data);
            this.dataSource.paginator = this.paginator;
            this.tblshow = true
            this.formshow = true
            this._notificationService.add(new Notification('success', " File verified successfully."));
          } else {
            // this._notificationService.add(new Notification('error', response.message));
            // this.fileUpload.nativeElement.value='';
            // this.bulkForm.get('kit_list').setValue('');
            this.dataSource = new MatTableDataSource(response.data);
            this.dataSource.paginator = this.paginator;
            this.tblshow = true
            //this.formshow = true
            this.bulkForm.get('kit_list').setValue(null)
             this.checkSubmitStatus = false;
             this.fileUpload.nativeElement.value='';
            this._notificationService.add(new Notification('error', "File already exists"));
          }

        },
          (error: any) => {
            if (error == "Server Error") {
              this.spinner.hide();
              this._notificationService.add(new Notification('error', 'Invalid json File'));
            }

          });
      } else {
        this.MessageAlertDataModel = {
          title: "Bulkupload",
          message: "Invalid File Type.",
          message2: "Upload .json File Only.",
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
    }
  }

  /**
   * Handle file type
   * @param event
   */
  handleImageInput(event) {
    let files = event.target.files;
    if (files.length) {
      let fileType = files.item(0).name.split('.');
      let imagesTypes = ['json'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
        this.validstatus = true;
        this.fileName = files.item(0).name;
        this.fileToUpload = files.item(0);
        if (event.target.files && event.target.files[0]) {
          const f = event.target.files[0];
          const reader = new FileReader();

          reader.onload = ((theFile) => {
            return (e) => {
              try {
                const json = JSON.parse(e.target.result);
                const resSTR = JSON.stringify(json);
                this.dataobj = JSON.parse(resSTR);
                //this.jsonadata = JSON.parse(resSTR);
              } catch (ex) {
              }
            };
          })(f);
          reader.readAsText(f);
        }
      } else {
        this.MessageAlertDataModel = {
          title: "Bulkupload",
          message: "Invalid File Type.",
          message2: "Upload .json File Only.",
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
   * Get template lookup
   * */
  gettemplateLookup() {
    this.deviceService.getkittypes().subscribe(response => {
      this.templateList = response['data'];
    });
  }

  /**
   * Upload file
   * */
  Upload() {
    this.spinner.show();
    let successMessage = this._appConstant.msgCreated.replace("modulename", "Hardware Kit");
    this.deviceService.uploadData(this.jsonadata).subscribe(response => {
      this.tblshow = false;
      this.formshow = false;
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.gettemplateLookup();
        this.checkSubmitStatus = false;
        this._notificationService.add(new Notification('success', successMessage));
        this.router.navigate(['/admin/hardwarekits']);
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
      this.bulkForm.reset();
    }
      , error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      });
  }

  /**
   * Cancel button
   * */
  Cancel() {
    this.checkSubmitStatus = false;
    this.tblshow = false;
    this.formshow = false;
    this.bulkForm.reset();
    this.router.navigate(['admin/hardwarekits']);
  }
}
