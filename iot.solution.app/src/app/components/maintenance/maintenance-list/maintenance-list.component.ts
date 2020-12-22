import { Component, OnInit } from '@angular/core';
import { LookupService, NotificationService, Notification, DeviceService } from 'app/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';
import { DeleteAlertDataModel, AppConstant } from 'app/app.constants';
import { DeleteDialogComponent } from '../..';
import { MatDialog } from '@angular/material';
@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.css']
})
export class MaintenanceListComponent implements OnInit {

  locationList: any = [];
  machines: any = [];
  displayedColumns: string[] = ['startDateTime', 'endDateTime', 'deviceName', 'entityName', 'status', 'actions'];
  isFilterShow: boolean = false;
  checkFilterSubmitStatus: boolean = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  maintenanceList: any = [];
  filterForm: FormGroup;
  totalRecords = 0;
  searchParameters = {
    entityGuid: '',
    deviceId: '',
    pageNumber: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'deviceName asc'
  };
  order = true;
  isSearch = false;

  constructor(
    public dialog: MatDialog,
    public lookupService: LookupService,
    public _notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private _service: DeviceService,
    public _appConstant: AppConstant,
    private spinner: NgxSpinnerService, ) { }

  ngOnInit() {
    this.createFilterFormGroup();

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationLookup(currentUser.userDetail.companyId);
    this.getMaintenance();
  }

  /**
 * Show hide filter
 */
  public showHideFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  /**
   * Get maintenence list
   * */
  getMaintenance() {
    this.spinner.show();
    this._service.getMaintenancelist(this.searchParameters).subscribe((response: any) => {
      this.spinner.hide();
      this.totalRecords = response.data.count;
      if (response.data.count) {
        this.maintenanceList = response.data.items;
      } else {
        this.maintenanceList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  createFilterFormGroup() {
    this.filterForm = this.formBuilder.group({
      entityGuid: [''],
      deviceId: ['']
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
    this.filterForm.controls.deviceId.setValue('');
    this.searchParameters.deviceId='';

    this.lookupService.getDevicelookup(locationId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.machines = response.data;
          this.machines = this.machines.filter(word => word.isActive == true);

        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this._notificationService.add(new Notification('error', error));
      })
  }

  // For filter maintanance list
  filterCall() {
    this.checkFilterSubmitStatus = true;
    if (this.filterForm.valid) {
      this.searchParameters.entityGuid = this.filterForm.value.entityGuid;
      this.searchParameters.deviceId = this.filterForm.value.deviceId;
      this.getMaintenance();
    }
  }

  setOrder(sort: any) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    if (sort.active == 'deviceName') {
      sort.active = 'deviceName';
    }
    this.searchParameters.sortBy = sort.active + ' ' + sort.direction;

    this.getMaintenance();

  }

  // For Cleare filter maintanance list
  clearFilter() {
    this.filterForm.reset();
    this.isFilterShow = false;
    this.checkFilterSubmitStatus = false;
    this.searchParameters.entityGuid = '';
    this.searchParameters.deviceId = '';
    this.getMaintenance();
  }

  getLocalDate(lDate) {
    // var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');

    // // Get the local version of that date
    // var localDate = moment(lDate).local();
    // let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    // return res;

    //var date = moment.utc().format('YYYY-MM-DD HH:mm:ss');

    //console.log(date); // 2015-09-13 03:39:27

    var stillUtc = moment.utc(lDate).toDate();
    var local = moment(stillUtc).local().format('MMM DD, YYYY hh:mm:ss A');
    return local;
  }

  deleteAlertDataModel: DeleteAlertDataModel;

  deleteModel(model: any) {
    this.deleteAlertDataModel = {
      title: "Delete Scheduled Maintenance",
      message: this._appConstant.msgConfirm.replace('modulename', "Scheduled Maintenance"),
      okButtonName: "Yes",
      cancelButtonName: "No",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteMaintenance(model.guid);
      }
    });
  }

  deleteMaintenance(guid) {
    this.spinner.show();
    this._service.deleteMaintenance(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Scheduled Maintenance")));
        this.getMaintenance();
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNumber = 1;
    this.isSearch = true;
    this.getMaintenance();
  }

  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.isSearch = true;
    this.getMaintenance();
  }

}
