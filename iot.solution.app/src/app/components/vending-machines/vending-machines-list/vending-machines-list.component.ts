import { Component, OnInit } from '@angular/core';
import { DeleteAlertDataModel, AppConstant } from '../../../app.constants';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { NotificationService, DeviceService, Notification } from '../../../services';
import { DeleteDialogComponent } from '../..';

@Component({
  selector: 'app-vending-machines-list',
  templateUrl: './vending-machines-list.component.html',
  styleUrls: ['./vending-machines-list.component.css']
})
export class VendingMachinesListComponent implements OnInit {

  displayedColumns: string[] = ['uniqueId', 'name', 'entityName', 'isProvisioned', 'action'];

  selectedLocation: any = '';
  locations = [];
  isFilterShow: boolean = false;
  deviceList: any = [];
  moduleName = "Devices";
  order = true;
  isSearch = false;
  totalRecords = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  reverse = false;
  orderBy = "name";
  mediaUrl: any;
  companyId: any;
  searchParameters = {
    entityGuid: '',
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
    sortBy: "name asc"
  };
  deleteAlertDataModel: DeleteAlertDataModel;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialog: MatDialog,
    public _service: DeviceService,
    public _appConstant: AppConstant,
    private _notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companyId = currentUser.userDetail.companyId;
    this.getVendingMachineList();
    this.getLocationLookup(this.companyId);
  }

  setOrder(sort: any) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.searchParameters.sortBy = sort.active + ' ' + sort.direction;
    this.getVendingMachineList();
  }

  /**
 * Get Location Lookup by companyId
 * */
  getLocationLookup(companyId) {
    this.locations = [];
    this._service.getLocationlookup(companyId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.locations = response['data'];
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
   * Page size change call
   * @param pageSize
   */
  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNumber = 1;
    this.isSearch = true;
    this.getVendingMachineList();
  }

  /**
   * Change page from pagination
   * @param pagechangeresponse
   */
  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.isSearch = true;
    this.getVendingMachineList();
  }

  /**
   * Search for text from list
   * @param filterText
   */
  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getVendingMachineList();
    this.isSearch = true;
  }

  /**
   * Get vending machine list
   * */
  getVendingMachineList() {
    this.spinner.show();
    this._service.getDeviceList(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.totalRecords = response.data.count;
        this.deviceList = response.data.items;
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
        this.deviceList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
  * Show hide filter
  */
  showHideFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  /**
   * Filter list by location
   * @param location
   */
  filterBy(location) {
    this.deviceList = [];
    this.searchParameters = {
      entityGuid: location,
      pageNumber: 0,
      pageSize: 10,
      searchText: "",
      sortBy: "name asc"
    };
    this.getVendingMachineList();
  }

  /**
   * Clear filter for inventory list
   * */
  clearFilter() {
    this.isFilterShow = false;
    this.deviceList = [];
    this.selectedLocation = '';
    this.searchParameters = {
      entityGuid: '',
      pageNumber: 0,
      pageSize: 10,
      searchText: "",
      sortBy: "name asc"
    };
    this.getVendingMachineList();

  }

}
