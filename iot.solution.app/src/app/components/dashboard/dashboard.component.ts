import * as moment from 'moment-timezone'

import { NgxSpinnerService } from 'ngx-spinner'
import { Router } from '@angular/router'
import { AppConstant, DeleteAlertDataModel } from "../../app.constants";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { DeleteDialogComponent } from '../../components/common/delete-dialog/delete-dialog.component';
import { locationobj } from './dashboard-model';
import { DashboardService, Notification, NotificationService, DeviceService, AlertsService } from '../../services';
/*Dynamic Dashboard Code*/
import {Component, OnInit,ChangeDetectorRef , EventEmitter, ViewChild} from '@angular/core';
import { DynamicDashboardService } from 'app/services/dynamic-dashboard/dynamic-dashboard.service';
import {DisplayGrid, CompactType, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType, GridsterComponentInterface, GridsterItemComponentInterface} from 'angular-gridster2';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
/*Dynamic Dashboard Code*/
@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit {
	public alerts: any = [];
	columnChart = {
		chartType: "ColumnChart",
		dataTable: [],
		options: {
			title: "",
			bar: {groupWidth: "40%"},
			vAxis: {
				title: "QTY",
				titleTextStyle: {
					bold: true
				},
				viewWindow: {
					min: 0
				}
			},
			hAxis: {
				titleTextStyle: {
					bold: true
				},
			},
			legend: 'none',
			height: "350",
			chartArea: {height: '75%', width: '85%'},
			seriesType: 'bars',
			// series: { 1: { type: 'line' } },
			colors: ['#41c363']
		}
	};
	/*Dynamic Dashboard Code*/
	@ViewChild('gridster',{static:false}) gridster;
	isDynamicDashboard : boolean = true;
	options: GridsterConfig;
	dashboardWidgets: Array<any> = [];
	dashboardList = [];
	dashboardData = {
		id : '',
		index : 0,
		dashboardName : '',
		isDefault : false,
		widgets : []
	};
	resizeEvent: EventEmitter<any> = new EventEmitter<any>();
	alertLimitchangeEvent: EventEmitter<any> = new EventEmitter<any>();
	chartTypeChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	zoomChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	telemetryDeviceChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	telemetryAttributeChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	sideBarSubscription : Subscription;
	deviceData: any = [];
	/*Dynamic Dashboard Code*/
	overviewstatics:any = {}
	locationobj = new locationobj();
	lat = 32.897480;
	lng = -97.040443;
	mediaUrl = "";
	locationList: any = [];
	isShowLeftMenu = true;
	isSearch = false;
	mapview = true;
	totalAlerts: any;
	totalFacilities: any;
	totalZones: any;
	totalIndoorZones: any;
	totalOutdoorZones: any;

	deleteAlertDataModel: DeleteAlertDataModel;
	countData : any = {
		totalAlerts : '-',
		totalUnderMaintenanceCount : '-',
		totalEnergyCount : '-',
		totalFuelUsed : '-',
		totalGenerators : '-',
		totalLocations : '-',
		minDeviceCount : '-',
		maxDeviceCount : '-',
		minDeviceName: '-',
		maxDeviceName: '-',
		totalUserCount : '-',
		totalConnected : '-',
		totalDisConnected : '-',
		totalDevices : '-'
	}
	searchParameters = {
		pageNumber: 0,
		pageNo: 0,
		pageSize: 10,
		searchText: '',
		sortBy: 'uniqueId asc'
	};
	ChartHead = ['Date/Time'];
	chartData = [];
	topproduct = [];
	datadevice: any = [];
	columnArray: any = [];
	headFormate: any = {
		columns: this.columnArray,
		type: 'NumberFormat'
	};
	bgColor = '#fff';
	chartHeight = 320;
	chartWidth = '100%';
	currentUser = JSON.parse(localStorage.getItem('currentUser'));
	message: any;
	color: string[];
	constructor(
		private router: Router,
		private spinner: NgxSpinnerService,
		private dashboardService: DashboardService,
		private _notificationService: NotificationService,
		private changeDetector: ChangeDetectorRef,
		public _appConstant: AppConstant,
		public dialog: MatDialog,
		public _service: AlertsService,
		public dynamicDashboardService: DynamicDashboardService,
		private deviceService: DeviceService

		) {
		/*Dynamic Dashboard Code*/
		this.sideBarSubscription = this.dynamicDashboardService.isToggleSidebarObs.subscribe((toggle) => {
			console.log("Sidebar clicked");
			if(this.isDynamicDashboard && this.dashboardList.length > 0){
				/*this.spinner.show();
				this.changedOptions();
		    	let cond = false;
		    	Observable.interval(700)
				.takeWhile(() => !cond)
				.subscribe(i => {
					console.log("Grid Responsive");
					cond = true;
					this.checkResponsiveness();
					this.spinner.hide();
				});*/
			}
		})
		/*Dynamic Dashboard Code*/
		this.mediaUrl = this._notificationService.apiBaseUrl;
	}

	ngOnInit() {
		this.getDashbourdCount();
		this.getDeviceList();
		/*Dynamic Dashboard Code*/
		this.options = {
			gridType: GridType.Fixed,
			displayGrid: DisplayGrid.Always,
			initCallback: this.gridInit.bind(this),
			itemResizeCallback: this.itemResize.bind(this),
			fixedColWidth: 20,
			fixedRowHeight: 20,
			keepFixedHeightInMobile: false,
			keepFixedWidthInMobile: false,
			mobileBreakpoint: 640,
			pushItems: false,
			draggable: {
				enabled: false
			},
			resizable: {
				enabled: false
			},
			enableEmptyCellClick: false,
			enableEmptyCellContextMenu: false,
			enableEmptyCellDrop: false,
			enableEmptyCellDrag: false,
			enableOccupiedCellDrop: false,
			emptyCellDragMaxCols: 50,
			emptyCellDragMaxRows: 50,

			minCols: 60,
			maxCols: 192,
			minRows: 58,
			maxRows: 375,
			setGridSize: true,
			swap: true,
			swapWhileDragging: false,
			compactType: CompactType.None,
			margin : 0,
			outerMargin : true,
			outerMarginTop : null,
			outerMarginRight : null,
			outerMarginBottom : null,
			outerMarginLeft : null,
		};
		/*Dynamic Dashboard Code*/
	}

	ngOnDestroy(): void {
		this.sideBarSubscription.unsubscribe();
	}

	/*Dynamic Dashboard Code*/
	getDashboards(){
		this.spinner.show();
		this.dashboardList = [];
		let isAnyDefault = false;
		let systemDefaultIndex = 0;
		this.dynamicDashboardService.getUserWidget().subscribe(response => {
			this.isDynamicDashboard = false;
			for (var i = 0; i <= (response.data.length - 1); i++) {
				response.data[i].id = response.data[i].guid;
				response.data[i].widgets = JSON.parse(response.data[i].widgets);
				this.dashboardList.push(response.data[i]);
				if(response.data[i].isDefault === true){
					isAnyDefault = true;
					this.dashboardData.index = i;
					this.isDynamicDashboard = true;
				}
				if(response.data[i].isSystemDefault === true){
					systemDefaultIndex = i;
				}
			}
			/*Display Default Dashboard if no data*/
			if(!isAnyDefault){
				this.dashboardData.index = systemDefaultIndex;
				this.isDynamicDashboard = true;
				this.dashboardList[systemDefaultIndex].isDefault = true;
			}
			/*Display Default Dashboard if no data*/
			this.spinner.hide();
			if(this.isDynamicDashboard){
				this.editDashboard('view','n');
			}
			else{
				this.getinventoryconsumptionbyproduct();
				this.getLocationList();
				this.getAlertList();
				this.getinventorystatus();
			}
		}, error => {
			this.spinner.hide();
			/*Load Old Dashboard*/
			this.isDynamicDashboard = false;
			this.getinventoryconsumptionbyproduct();
			this.getLocationList();
			this.getAlertList();
			this.getinventorystatus();
			/*Load Old Dashboard*/
			this._notificationService.handleResponse(error,"error");
		});
	}

	editDashboard(type : string = 'view',is_cancel_btn : string = 'n'){
		this.spinner.show();
		this.dashboardWidgets = [];

		this.dashboardData.id = '';
		this.dashboardData.dashboardName = '';
		this.dashboardData.isDefault = false;
		for (var i = 0; i <= (this.dashboardList[this.dashboardData.index].widgets.length - 1); i++) {
			this.dashboardWidgets.push(this.dashboardList[this.dashboardData.index].widgets[i]);
		}

		if (this.options.api && this.options.api.optionsChanged) {
			this.options.api.optionsChanged();
		}
		this.spinner.hide();
	}

	gridInit(grid: GridsterComponentInterface) {
		if (this.options.api && this.options.api.optionsChanged) {
			this.options.api.optionsChanged();
		}
		/*let cond = false;
    	Observable.interval(500)
		.takeWhile(() => !cond)
		.subscribe(i => {
			cond = true;
			this.checkResponsiveness();
		});*/
	}

	checkResponsiveness(){
		if(this.gridster){
			let tempWidth = 20;
			if(this.gridster.curWidth >= 640 && this.gridster.curWidth <= 1200){
				/*tempWidth = Math.floor((this.gridster.curWidth / 60));
				this.options.fixedColWidth = tempWidth;*/
			}
			else{
				this.options.fixedColWidth = tempWidth;
			}
			for (var i = 0; i <= (this.dashboardWidgets.length - 1); i++) {
				if(this.gridster.curWidth < 640){
					for (var g = 0; g <= (this.gridster.grid.length - 1); g++) {
						if(this.gridster.grid[g].item.id == this.dashboardWidgets[i].id){
							this.dashboardWidgets[i].properties.w = this.gridster.grid[g].el.clientWidth;
						}
					}
				}
				else{
					this.dashboardWidgets[i].properties.w = (tempWidth * this.dashboardWidgets[i].cols);
				}
				this.resizeEvent.emit(this.dashboardWidgets[i]);
			}
			this.changedOptions();
		}
	}

	changedOptions() {
		if (this.options.api && this.options.api.optionsChanged) {
			this.options.api.optionsChanged();
		}
	}

	itemResize(item: any, itemComponent: GridsterItemComponentInterface) {
		this.resizeEvent.emit(item);
	}

	deviceSizeChange(size){
		this.checkResponsiveness();
	}

	getDeviceList(){
		this.spinner.show();
		this.deviceData = [];
		this.deviceService.getdevices().subscribe(response => {
			if (response.isSuccess === true){
				this.deviceData = response.data;
			}
			else
				this._notificationService.handleResponse(response,"error");
			this.changeDetector.detectChanges();
			this.getDashboards();
		}, error => {
			this.spinner.hide();
			this._notificationService.handleResponse(error,"error");
			this.changeDetector.detectChanges();
		});
	}
	
	/*Dynamic Dashboard Code*/
	/**
	 * Get Inventory Status graph
	 * */
	 getinventorystatus() {
	 	this.spinner.show();
	 	let data = {
	 		"companyGuid":this.currentUser.userDetail.companyId
	 	}
	 	this.dashboardService.getinventorystatus(data).subscribe(response => {
	 		this.spinner.hide();
	 		if (response.isSuccess === true) {
	 			let data = [];
	 			if (response.data.length) {
	 				data.push(['Months', 'Consumption'])

	 				response.data.forEach(element => {
	 					if(element.color == 'Green'){
	 						this.color = ['#5496d0']
	 					}else{
	 						this.color = ['#FF0000']
	 					}
	 					data.push([element.deviceName, parseFloat(element.totalAvailableQty)])
	 				});
	 			}
	 			this.columnChart = {
	 				chartType: "ColumnChart",
	 				dataTable: data,
	 				options: {
	 					title: "",
	 					vAxis: {
	 						title: "(QTY)",
	 						titleTextStyle: {
	 							bold: true
	 						},
	 						viewWindow: {
	 							min: 0
	 						}
	 					},
	 					hAxis: {
	 						titleTextStyle: {
	 							bold: true
	 						},
	 					},
	 					legend: 'none',
	 					height: "350",
	 					chartArea: { height: '75%', width: '85%' },
	 					seriesType: 'bars',
	 					bar: { groupWidth: "25%" },
	 					colors: this.color,
	 				}
	 			};
	 		}
	 		else {
	 			this.columnChart.dataTable = [];
	 			this._notificationService.add(new Notification('error', response.message));

	 		}
	 	}, error => {
	 		this.columnChart.dataTable = [];
	 		this.spinner.hide();
	 		this._notificationService.add(new Notification('error', error));
	 	});
	 }
	/**
	 * Get Product graph
	 * */
	 getinventoryconsumptionbyproduct() {
	 	this.spinner.show();
	 	let data = {
	 		"companyGuid":this.currentUser.userDetail.companyId,
	 		"timeZone":moment().utcOffset(),
	 		"currentDate":moment(new Date()).format('YYYY-MM-DDTHH:mm:ss')
	 	}
	 	this.dashboardService.getinventoryconsumptionbyproduct(data).subscribe(response => {
	 		this.spinner.hide();
	 		if (response.isSuccess === true) {
	 			this.topproduct = response.data;
	 			this.message =response.message
	 		}
	 		else {
	 			this._notificationService.add(new Notification('error', response.message));
	 		}
	 	}, error => {
	 		this.spinner.hide();
	 		this._notificationService.add(new Notification('error', error));
	 	});
	 }

	/**
   * get Percent
   */
   getPercent(totalAvalableQty,totalCapacity){

   	if(totalCapacity==0)
   	{
   		if(totalAvalableQty==0)
   		{
   			return (100);
   		}
   	}
   	let per=(totalAvalableQty*100)/totalCapacity;
   	return(per);
   }

   /**
	 * Get Alert List
	 * */
	 getAlertList() {
	 	let parameters = {
	 		pageNo: 0,
	 		pageSize: 8,
	 		searchText: '',
	 		orderBy: 'eventDate desc',
	 		deviceGuid: '',
	 		entityGuid: '',
	 	};
	 	this.spinner.show();
	 	this._service.getAlerts(parameters).subscribe(response => {
	 		this.spinner.hide();
	 		if (response.isSuccess === true) {
	 			if (response.data.count) {
	 				this.alerts = response.data.items;
	 			}

	 		}
	 		else {
	 			this.alerts = [];
	 			this._notificationService.add(new Notification('error', response.message));

	 		}
	 	}, error => {
	 		this.alerts = [];

	 		this._notificationService.add(new Notification('error', error));
	 	});
	 }

	/**
	 * Redirect On Add Location
	 * */
	 clickAdd() {
	 	this.router.navigate(['location/add']);
	 }

   /**
	 * Convert To float
   * @param value
   * */
   convertToFloat(value) {
   	return parseFloat(value)
   }
	/**
	 * Get Timezone
	 * */
	 getTimeZone() {
	 	return /\((.*)\)/.exec(new Date().toString())[1];
	 }
	/**
	 * Get count of variables for Dashboard
	 * */
	 getDashbourdCount() {
	 	this.spinner.show();
	 	this.dashboardService.getDashboardoverview(this.currentUser.userDetail.companyId).subscribe(response => {
	 		if (response.isSuccess === true) {
	 			this.overviewstatics = response.data;
	 			//this.countData.totalAlerts = (response.data.totalAlerts) ? response.data.totalAlerts : 0
	 			this.countData.totalUnderMaintenanceCount = response.data.totalUnderMaintenanceCount
	 			this.countData.totalEnergyCount = response.data.totalEnergyCount
	 			this.countData.totalFuelUsed = response.data.totalFuelUsed
	 			this.countData.totalGenerators = (response.data.totalGenerators) ? response.data.totalGenerators : 0
	 			this.countData.totalLocations = (response.data.totalEntities) ? response.data.totalEntities : 0
	 			this.countData.totalDevices = (response.data.totalDevices) ? response.data.totalDevices : 0
	 			this.countData.minDeviceCount = (response.data.minDeviceCount) ? response.data.minDeviceCount : 0
	 			this.countData.maxDeviceCount = (response.data.maxDeviceCount) ? response.data.maxDeviceCount : 0
	 			this.countData.minDeviceName = (response.data.minDeviceName) ? response.data.minDeviceName : '-'
	 			this.countData.maxDeviceName = (response.data.maxDeviceName) ? response.data.maxDeviceName : '-'
	 			this.countData.totalConnected = (response.data.totalConnected) ? response.data.totalConnected : 0
	 			this.countData.totalDisConnected = (response.data.totalDisConnected) ? response.data.totalDisConnected : 0
	 			this.countData.totalUserCount = (response.data.totalUserCount) ? response.data.totalUserCount : 0
	 			this.countData.activeUserCount = (response.data.activeUserCount) ? response.data.activeUserCount : 0
	 			this.countData.inactiveUserCount = (response.data.inactiveUserCount) ? response.data.inactiveUserCount : 0
	 		}
	 		else {
	 			this._notificationService.add(new Notification('error', response.message));
	 		}
	 		this.changeDetector.detectChanges();
	 	}, error => {
	 		this.spinner.hide();
	 		this._notificationService.add(new Notification('error', error));
	 	});
	 }

	/**
   * Search Text
   * @param filterText
   */
   search(filterText) {
   	this.searchParameters.searchText = filterText;
   	this.searchParameters.pageNo = 0;
   	this.getLocationList();
   }
	/**
   * get Location List
   */
   getLocationList() {
   	this.locationList = [];
   	this.spinner.show();
   	this.dashboardService.geLocationlist(this.searchParameters).subscribe(response => {
   		this.spinner.hide();
   		if (response.isSuccess === true) {
   			//this.lat = response.data.items[0].latitude;
   			// this.lng = response.data.items[0].longitude;
   			this.locationList = response.data.items

   		}
   		else {
   			// response.message ? response.message : response.message = "No results found";
   			this._notificationService.add(new Notification('error', response.message));
   		}
   	}, error => {
   		this.spinner.hide();
   		this._notificationService.add(new Notification('error', error));
   	});
   }
	/**
   * deleteModel
   * @param id
   */
   deleteModel(id: any) {
   	this.deleteAlertDataModel = {
   		title: "Delete Location",
   		message: this._appConstant.msgConfirm.replace('modulename', "location"),
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
   			this.deletelocation(id);
   		}
   	});
   }

	/**
   * Search Callback by filterText
   * @param filterText
   */

   searchTextCallback(filterText) {
   	this.searchParameters.searchText = filterText;
   	this.searchParameters.pageNumber = 0;
   	this.getLocationList();
   	this.isSearch = true;
   }
	/**
   * Delete Location by guid
   * @param guid
   */
   deletelocation(guid) {
   	this.spinner.show();
   	this.dashboardService.deletelocation(guid).subscribe(response => {
   		this.spinner.hide();
   		if (response.isSuccess === true) {
   			this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Location")));
   			this.getLocationList();

   		}
   		else {
   			this._notificationService.add(new Notification('error', response.message));
   		}

   	}, error => {
   		this.spinner.hide();
   		this._notificationService.add(new Notification('error', error));
   	});
   }
 	/**
   * Get LocalDate by lDate
   * @param lDate
   */
   getLocalDate(lDate) {
   	var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
   	var localDate = moment(utcDate).local();
   	let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
   	return res;

   }

}
