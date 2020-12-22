import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { AppConstant, DeleteAlertDataModel } from '../../../app.constants';
import { NotificationService, Notification, DeviceService } from '../../../services';
import { InventoryService } from '../../../services/inventory/inventory.service';
import { ProductService } from '../../../services/product/product.service';
import * as moment from 'moment-timezone';
import { DeleteDialogComponent } from '../..';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent implements OnInit {

  deleteAlertDataModel: DeleteAlertDataModel;
  selectedProduct: any = '';
  selectedLocation: any = '';
  selectedMachine: any = '';
  selectedProductType: any = '';
  productTypes = [];
  machines = [];
  locations = [];
  products = [];
  isFilterShow: boolean = false;
  displayedColumns: string[] = ['entityName', 'deviceName', 'shelfId', 'productType', 'productName', 'availableQty', 'refillDateTime', 'actions'];
  inventoryList = [];

  modalTableColumns: string[] = ['productType', 'productName', 'operation','refillQuantity', 'refillDate'];
  historyList = [];
  history: any = {};
  dataSource: MatTableDataSource<any>;
  order = true;
  isSearch = false;
  totalRecords = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  searchParameters = {
    entityId: '',
    deviceId: '',
    productId: '',
    productTypeGuid:'',
    pageNo: 0,
    pageSize: 10,
    searchText: "",
    orderBy: "refillDateTime desc"
  };
  mediaUrl: any;
  companyId: any;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialog: MatDialog,
    public _service: InventoryService,
    public deviceService: DeviceService,
    public productServie: ProductService,
    public _appConstant: AppConstant,
    private _notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companyId = currentUser.userDetail.companyId;
    this.getLocationLookup(this.companyId);
    this.getInventoryList();
  }

  /**
   * set order
   * @param sort
   */
  setOrder(sort: any) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.searchParameters.orderBy = sort.active + ' ' + sort.direction;
    this.getInventoryList();
  }

  /**
  * appl
  * @param filterValue
  */
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  onKey(filterValue: string) {
    this.applyFilter(filterValue);
  }

  /**
   * Get inventory list
   * */
  getInventoryList() {
    this.spinner.show();
    this._service.getInventoryList(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.totalRecords = response.data.count;
        this.inventoryList = response.data.items;
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
        this.inventoryList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Get inventory history list
   * */
  getInventoryHistoryList(deviceItemGuid) {
    this.historyList = [];
    this.history = {};
    this.spinner.show();
    this._service.getInventoryHistoryList(deviceItemGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.history = response.data;
        this.historyList = response.data.refillDetails;
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
        this.historyList = [];
        this.history = {};
      }
    }, error => {
      this.historyList = [];
      this.history = {};
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * On page size change
   * @param pageSize
   */
  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNo = 1;
    this.isSearch = true;
    this.getInventoryList();
  }

  /**
   * Change page size
   * @param pagechangeresponse
   */
  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageNo = pagechangeresponse.pageIndex;
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.isSearch = true;
    this.getInventoryList();
  }

  /**
   * Serch text
   * @param filterText
   */
  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNo = 0;
    this.getInventoryList();
    this.isSearch = true;
  }

  /**
  * Get Location Lookup by companyId
  * */
  getLocationLookup(companyId) {
    this.locations = [];
    this.deviceService.getLocationlookup(companyId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.locations = response['data'];
          this.machines = [];
          this.productTypes = [];
          this.products = [];
          this.selectedMachine = '';
          this.selectedProductType = '';
          this.selectedProduct = '';
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
  * Get Device Lookup by location
  * */
  getDeviceLookup(entityId) {
    this.machines = [];
    this.deviceService.getDeviceLookup(entityId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.machines = response['data'];
          this.productTypes = [];
          this.products = [];
          this.selectedMachine = '';
          this.selectedProductType = '';
          this.selectedProduct = '';
          if (response.data.length == 1) {
            this.getProductTypeLookup(response.data[0].value);
          }
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
  * Get Product Type Lookup
  * */
  getProductTypeLookup(deviceId) {
    this.productTypes = [];
    this._service.getProductTypeLookup(deviceId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.productTypes = response['data'];
          this.products = [];
          this.selectedProduct = '';
          if (response.data.length == 1) {
            this.getProductLookup(response.data[0].value);
          }
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
  * Get Product Lookup by productTypeId
  * */
  getProductLookup(productTypeId) {
    this.products = [];
    this.productServie.getProductLookup(productTypeId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.products = response['data'];
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      });
  }

  /**
   * Get local date
   * @param lDate
   */
  getLocalDate(lDate) {
    var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
    // Get the local version of that date
    var localDate = moment(utcDate).local();
    let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    return res;

  }

  /**
   * Show hide filter
   * */
  showHideFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  /**
   * Clear filter for inventory list
   * */
  clearFilter() {
    this.isFilterShow = false;
    this.inventoryList = [];
    this.searchParameters = {
      entityId: '',
      deviceId: '',
      productId: '',
      productTypeGuid:'',
      pageNo: 0,
      pageSize: 10,
      searchText: "",
      orderBy: "refillDateTime desc"
    };
    this.selectedProduct = '';
    this.selectedLocation = '';
    this.selectedMachine = '';
    this.selectedProductType = '';
    this.locations = [];
    this.machines = [];
    this.productTypes = [];
    this.products = [];
    this.getLocationLookup(this.companyId);
    this.getInventoryList();
  }

  /**
   * Filter by 
   * @param location
   * @param nachine
   * @param type
   * @param product
   */
  filterBy(location, machine, type, product) {
    
    this.inventoryList = [];
    this.searchParameters = {
      entityId: location,
      deviceId: machine,
      productId: product,
      productTypeGuid: type,
      pageNo: 0,
      pageSize: 10,
      searchText: "",
      orderBy: "refillDateTime desc"
    };
    this.getInventoryList();
  }

  clearShelfModel(inventory: any) {
    this.deleteAlertDataModel = {
      title: "Clear Shelf",
      message: "Are you sure you want to clear this shelf?",
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
        this.clearShelf(inventory.guid);
      }
    });
  }

  clearShelf(inventoryId) {
    this.spinner.show();
    this._service.clearShelf(inventoryId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.spinner.hide();
          this.getInventoryList();
          this._notificationService.add(new Notification('success', response.message));
        }
        else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      });
  }
}
