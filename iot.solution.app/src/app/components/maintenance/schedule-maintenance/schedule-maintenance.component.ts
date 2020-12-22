import { Component, OnInit } from '@angular/core';
import {  Notification, NotificationService, LookupService, DeviceService } from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { AppConstant } from '../../../app.constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import { MaintenanceService } from '../../../services/maintenance/maintenance.service';
import * as moment from 'moment'

@Component({
  selector: 'app-schedule-maintenance',
  templateUrl: './schedule-maintenance.component.html',
  styleUrls: ['./schedule-maintenance.component.css']
})
export class ScheduleMaintenanceComponent implements OnInit {
  public dateTimeRange: Date[];
  rangeFromLabel = 'From';
  rangeToLabel = 'To';
  locationList: any = [];
  isEdit = false;
  maintenance: any;
  maintenanceGuid: any;
  moduleName = "Schedule Maintenance";
  buttonname = "Submit";
  maintenanceForm: FormGroup;
  maintenanceObject: any = {};
  machines: any = [];
  checkSubmitStatus = false;
  today:any;
  public endDateValidate :any;
  minDate:any;

  refrigeratorNames = [
    { value: 'refrigerator_1', viewValue: 'Refrigerator 1' },
    { value: 'refrigerator_2', viewValue: 'Refrigerator 2' },
    { value: 'refrigerator_3', viewValue: 'Refrigerator 3' }
  ];
  maintenanceStatus = [{ "value": "Scheduled",'disabled':false }, { "value": "Under maintenance",'disabled':false }, { "value": "Completed",'disabled':false }];

  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private router: Router,
    private _service: DeviceService,
    public dialog: MatDialog,
    public _appConstant: AppConstant,
    public lookupService: LookupService,
    private _notificationService: NotificationService,
    // private refrigeratorService: RefrigeratorService,
    // private _service: MaintenanceService
    ) {
    
    this.activatedRoute.params.subscribe(params => {
      console.log(params.maintenanceGuid);
      
      if (params.maintenanceGuid != 'add') {
        this.isEdit = true;
        this.createFormGroup();
        this.maintenanceGuid = params.maintenanceGuid;
        this.moduleName = "Update Maintenance";
        this.buttonname = 'Update'
        setTimeout(() => {
          this.getMaintenanceDetails(this.maintenanceGuid);
        }, 200);

      } else {
        this.createFormGroup();
        this.maintenanceObject = { name: '', zipcode: '', countryGuid: '', stateGuid: '', isActive: 'true', city: '', latitude: '', longitude: '' }
      }
    });
  }

  ngOnInit() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationLookup(currentUser.userDetail.companyId);
    this.today = new Date();
    let  dd = this.today.getDate();
    let mm = this.today.getMonth()+1; //January is 0!
    let yyyy = this.today.getFullYear();
    this.minDate = new Date(yyyy, mm-1, dd);

    if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 

    this.today = yyyy+'-'+mm+'-'+dd;
    this.endDateValidate = yyyy+'-'+mm+'-'+dd;
  }

  createFormGroup() {
    this.maintenanceForm = new FormGroup({
      entityGuid: new FormControl({ value: '', disabled: this.isEdit }, [Validators.required]),
      deviceGuid: new FormControl({ value: '', disabled: this.isEdit }, [Validators.required]),
      description: new FormControl(null),
      timeZone: new FormControl(''),
      startDateTime: new FormControl({ value: '', disabled: false }, [Validators.required]),
      endDateTime: new FormControl({ value: '', disabled: false }, [Validators.required]),
    });
  }

    /**
 * Get Location Lookup by companyId
 * @param companyId
 */
getLocationLookup(companyId) {
  this.lookupService.getLocationlookup(companyId).
    subscribe(response => {
      if (response.isSuccess === true) {
        this.locationList = response.data;
        this.locationList = this.locationList.filter(word => word.isActive == true);

      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    })
}

  /**
 * Get Refrigerator Lookup by locationId
 * @param locationId
 */
getMachineslookup(locationId) {
  this.spinner.show();
  this.lookupService.getDevicelookup(locationId).
    subscribe(response => {
      if (response.isSuccess === true) {
        this.spinner.hide();
        this.machines = response.data;
        this.machines = this.machines.filter(word => word.isActive == true);

      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    })
}

  /**
   * Disable date
   * */
  disabledDate(){
  /*if((this.maintenanceObject['status']=='Scheduled' || this.maintenanceObject['status']=='Under maintenance') && this.isEdit){
    return true
  } else {
    return false
  }*/
  }

  getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }

        /**
   * validate end date using start date change
   * @param startdate
   */
  onChangeStartDate(startdate) {
    let date = moment(startdate).add(this._appConstant.minGap, 'm').format();
    this.endDateValidate = new Date(date);
    console.log(this.endDateValidate);
    
  }
  getLocalDate(lDate) {
    

var stillUtc = moment.utc(lDate).toDate();
var local = moment(stillUtc).local().format('MMM DD, YYYY hh:mm:ss A');
return local;
  }
  /**
   * Get maintenance detials maintananceID
   * @param maintananceID
   */
  getMaintenanceDetails(maintananceID) {
    this.spinner.show();
    this._service.getMaintenanceDetails(maintananceID).subscribe(response => {
      if (response.isSuccess === true) {
        this.maintenanceObject = response.data;
        this.maintenanceObject.entityGuid = this.maintenanceObject.entityGuid.toUpperCase();
        this.maintenanceObject.deviceGuid = this.maintenanceObject.deviceGuid.toUpperCase();
        this.maintenanceObject.startDateTime = moment(this.maintenanceObject.startDateTime+'Z').local();
        this.maintenanceObject.endDateTime = moment(this.maintenanceObject.endDateTime+'Z').local();
        if(this.maintenanceObject.status=='Under Maintenance'){
          this.maintenanceStatus[0].disabled=true;
        }
        if(this.maintenanceObject.status=='Completed'){
          this.maintenanceForm.controls['startDateTime'].disable();
          this.maintenanceForm.controls['endDateTime'].disable();
          this.maintenanceStatus[0].disabled=true;
          this.maintenanceStatus[1].disabled=true;
        }
        
        this.spinner.hide();
        this.getMachineslookup(this.maintenanceObject.entityGuid)
        //  this.locationService.getstatelist(response.data.countryGuid).subscribe(response => {
        //    this.stateList = response.data;
        //    this.spinner.hide();
        //  });
      }
    });
  }

  /**
   * Schedule Maintenance
   * */
  scheduleMaintenance() {
    this.checkSubmitStatus = true;
  var maintenance={...this.maintenanceForm.value};
  maintenance.startDateTime = moment(maintenance.startDateTime).format('YYYY-MM-DDTHH:mm:ss');
    maintenance.endDateTime = moment(maintenance.endDateTime).format('YYYY-MM-DDTHH:mm:ss');
    maintenance.timeZone = moment().utcOffset();
    // maintenance.scheduledDate  = moment(maintenance.scheduledDate).format('YYYY-MM-DDT00:00:00');
    //  new Date(maintenance.scheduledDate)
    if (this.isEdit) {
      this.maintenanceForm.registerControl('guid', new FormControl(this.maintenanceGuid))
    }
    if (this.maintenanceForm.status === "VALID") {

      this.spinner.show();
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      let data = maintenance;
      if (this.isEdit) {
        data.entityGuid = this.maintenanceForm.get('entityGuid').value;
        data.deviceGuid = this.maintenanceForm.get('deviceGuid').value;
        data.guid = this.maintenanceGuid;
      }
      console.log(data);

      this._service.scheduleMaintenance(data).subscribe(response => {
        if (response.isSuccess === true) {
          this.spinner.hide();
          if (this.isEdit) {
            this._notificationService.add(new Notification('success', "Scheduled Maintenance has been updated successfully."));
          } else {
            this._notificationService.add(new Notification('success', "Scheduled Maintenance has been added successfully."));
          }
          this.router.navigate(['/maintenance']);
        } else {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', response.message));
        }
      });
    }
  }
}
