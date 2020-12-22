import { Component, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { NgxSpinnerService } from 'ngx-spinner'
import { UserService } from 'app/services/user/user.service';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { DeleteDialogComponent } from '../../../components/common/delete-dialog/delete-dialog.component';
import { tap } from 'rxjs/operators';
import { AppConstant, DeleteAlertDataModel } from "../../../app.constants";
import { Notification, NotificationService } from 'app/services';
import { empty } from 'rxjs';

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css']
})

export class UserListComponent implements OnInit {
	changeStatusDeviceName:any;
	changeStatusDeviceStatus:any;
	changeDeviceStatus:any;
	deleteAlertDataModel: DeleteAlertDataModel;
	currentUser = JSON.parse(localStorage.getItem("currentUser"));
	userList = [];
	totalRecords = 0;
	pageSizeOptions: number[] = [5, 10, 25, 100];
	moduleName = "Users";
	displayedColumns: string[] = ['firstName', 'lastName', 'email', 'roleName', 'contactNo', 'isActive', 'action'];
	order = true;
	isSearch = false;
	reverse = false;
	orderBy = 'name';
	searchParameters = {
		pageNumber: 0,
		pageSize: 10,
		searchText: '',
		sortBy: 'firstName asc'
	};
	dataSource: MatTableDataSource<any>;
	@ViewChild('paginator', { static: false }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: false }) sort: MatSort;

	constructor(
		public dialog: MatDialog,
		private spinner: NgxSpinnerService,
		private router: Router,
		private userService: UserService,
		public _appConstant: AppConstant,
		private _notificationService: NotificationService
	) { }

	ngOnInit() {
		this.getUserList();

	}

	applyFilter(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.dataSource.filter = filterValue;
	}
	clickAdd() {
		this.router.navigate(['/users/add']);
	}

	setOrder(sort: any) {
		console.log(sort);
		if (!sort.active || sort.direction === '') {
			return;
		}
		this.searchParameters.sortBy = sort.active + ' ' + sort.direction;
		this.getUserList();
	}

	log(obj) {
		console.log(obj);
	}
	onPageSizeChangeCallback(pageSize) {
		this.searchParameters.pageSize = pageSize;
		this.searchParameters.pageNumber = 1;
		this.isSearch = true;
		this.getUserList();
	}

	ChangePaginationAsPageChange(pagechangeresponse) {
		this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
		this.searchParameters.pageSize = pagechangeresponse.pageSize;
		this.isSearch = true;
		this.getUserList();
	}

	searchTextCallback(filterText) {
		this.searchParameters.searchText = filterText;
		this.searchParameters.pageNumber = 0;
		this.getUserList();
		this.isSearch = true;
	}

	getUserList() {
		this.spinner.show();
		this.userService.getUserlist(this.searchParameters).subscribe(response => {
			this.spinner.hide();
			if (response.data.items) {
				this.totalRecords = response.data.count;
				// this.isSearch = false;
				this.userList = response.data.items;
			}
			else {
				this._notificationService.add(new Notification('error', response.message));
				this.userList = [];
			}
		}, error => {
			this.spinner.hide();
			this._notificationService.add(new Notification('error', error));
		});
	}

	onKey(filterValue: string) {
		this.applyFilter(filterValue);
	}

	deleteModel(userModel: any) {
		this.deleteAlertDataModel = {
			title: "Delete User",
			message: this._appConstant.msgConfirm.replace('modulename', "User"),
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
				this.deleteuser(userModel.guid);
			}
		});
	}

	deleteuser(guid) {
		this.spinner.show();
		this.userService.deleteUser(guid).subscribe(response => {
			this.spinner.hide();
			if (response.isSuccess === true) {
				this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "User")));
				this.getUserList();

			}
			else {
				this._notificationService.add(new Notification('error', response.message));
			}

		}, error => {
			this.spinner.hide();
			this._notificationService.add(new Notification('error', error));
		});
	}

	activeInactiveuser(id: string, isActive: boolean, fname: string, lname: string) {
		var status = isActive == false ? this._appConstant.activeStatus : this._appConstant.inactiveStatus;
		var mapObj = {
			statusname: status,
			fieldname: fname + " " + lname,
			modulename: ""
		};
		this.deleteAlertDataModel = {
			title: "Status",
			message: this._appConstant.msgStatusConfirm.replace(/statusname|fieldname|modulename/gi, function (matched) {
				return mapObj[matched];
			}),
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
				this.changeUserStatus(id, isActive);

			}
		});

	}
	changeUserStatus(id, isActive) {

		this.spinner.show();
		this.userService.changeStatus(id, isActive).subscribe(response => {
			this.spinner.hide();
			if (response.isSuccess === true) {
				this._notificationService.add(new Notification('success', this._appConstant.msgStatusChange.replace("modulename", "User")));
				this.getUserList();

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
