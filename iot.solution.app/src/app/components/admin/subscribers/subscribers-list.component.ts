import { Component, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { NgxSpinnerService } from 'ngx-spinner'
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material'
import { DeleteDialogComponent } from '../../common/delete-dialog/delete-dialog.component';
import { DeviceService, NotificationService } from 'app/services';
import{Notification} from 'app/services/notification/notification.service';
import { AppConstant, DeleteAlertDataModel } from "../../../app.constants";

@Component({ selector: 'app-subscribers-list', templateUrl: './subscribers-list.component.html', styleUrls: ['./subscribers-list.component.scss'] })

export class SubscribersListComponent implements OnInit {
	changeStatusDeviceName:any;
	changeStatusDeviceStatus:any;
	order = true;
	isSearch = false;
	pageSizeOptions: number[] = [5, 10, 25, 100];
	reverse = false;
	orderBy = 'companyName';
	totalRecords=0;
	searchParameters = {
		pageNo:0,
		pageSize: 10,
		searchText: '',
		sortBy: 'companyName asc'
	};
	displayedColumns: string[] = [ 'subscriberName','companyName', 'email','subscriptionStartDate','subscriptionEndDate','planName'];
	dataSource=[];
	deleteAlertDataModel : DeleteAlertDataModel ; 
	
	constructor(
		private spinner: NgxSpinnerService,
		private router: Router,
		public dialog: MatDialog,
		private deviceService:DeviceService,
		private _notificationService: NotificationService,
		public _appConstant : AppConstant
	) { }

	ngOnInit() {
		this.getSubscribersList();
	}

	clickAdd() {
		this.router.navigate(['/device/add']);
	}

	setOrder(sort: any) {
		if (!sort.active || sort.direction === '') {
			return;
	   }
	  	this.searchParameters.sortBy = sort.active + ' ' + sort.direction;
		this.getSubscribersList();
	}

	deleteModel(DeviceModel: any) {
		this.deleteAlertDataModel = {
			title: "Delete Device" ,
			message: this._appConstant.msgConfirm.replace('modulename', "device"), 
			okButtonName: "Yes",
			cancelButtonName: "No" ,
		};
		const dialogRef = this.dialog.open(DeleteDialogComponent, {
			width: '400px',
			height: 'auto',
			data: this.deleteAlertDataModel,
			disableClose: false
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.deleteDevice(DeviceModel.guid);
			}
		});
	}

  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNo = 1;
    this.isSearch = true;
    this.getSubscribersList();
  }

	ChangePaginationAsPageChange(pagechangeresponse) {
	this.searchParameters.pageNo = pagechangeresponse.pageIndex;
	this.searchParameters.pageSize = pagechangeresponse.pageSize;
	this.isSearch = true;
    this.getSubscribersList();
	}

	searchTextCallback(filterText) {
		this.searchParameters.searchText = filterText;
		this.searchParameters.pageNo = 0;
		this.getSubscribersList();
		this.isSearch = true;
	}


	
	getSubscribersList() {
		this.spinner.show();
		this.deviceService.getsubscribers(this.searchParameters).subscribe(response => {
			this.spinner.hide();
			if (response.isSuccess === true) {
				this.totalRecords = response.data.count;
				this.dataSource = response.data.items;
			}
			else {
				this._notificationService.add(new Notification('error', response.message));
				this.dataSource = [];
			}
		}, error => {
			this.spinner.hide();
			this._notificationService.add(new Notification('error', error ));
		});
	}
	
	activeInactiveDevice(deviceId: string, isActive: boolean, name:string) {
		var status = isActive == false ? this._appConstant.activeStatus : this._appConstant.inactiveStatus;
		var mapObj = {
			statusname:status,
			fieldname:name,
			modulename:"device"
		 };
		this.deleteAlertDataModel = {
			title: "Status",
			message: this._appConstant.msgStatusConfirm.replace(/statusname|fieldname|modulename/gi, function(matched){
				return mapObj[matched];
			  }),
			okButtonName: "Yes",
			cancelButtonName: "No" ,
		};
		const dialogRef = this.dialog.open(DeleteDialogComponent, {
			width: '400px',
			height: 'auto',
			data: this.deleteAlertDataModel,
			disableClose: false
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.changeDeviceStatus(deviceId, isActive);

			}
		});
	
	}

	changeDeviceStatus(deviceId, isActive) {
		this.spinner.show();
		this.deviceService.changeStatus(deviceId, isActive).subscribe(response => {
			this.spinner.hide();
			if (response.isSuccess === true) {
				this._notificationService.add(new Notification('success', this._appConstant.msgStatusChange.replace("modulename", "Device")));
				this.getSubscribersList();

			}
			else {
				this._notificationService.add(new Notification('error', response.message));
			}
			
		}, error => {
			this.spinner.hide();
			this._notificationService.add(new Notification('error', error));
		});
	}

	deleteDevice(guid) {
		this.spinner.show();
		this.deviceService.deleteDevice(guid).subscribe(response => {
			this.spinner.hide();
			if (response.isSuccess === true) {
				this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Device")));
				this.getSubscribersList();
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
