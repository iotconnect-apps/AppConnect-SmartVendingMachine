import { ChangeDetectorRef, ViewRef , OnInit, Component, Input, ViewEncapsulation, EventEmitter } from '@angular/core';
import * as moment from 'moment-timezone'
import { NgxSpinnerService } from 'ngx-spinner'
import { DashboardService } from 'app/services/dashboard/dashboard.service';
import { Notification, NotificationService, AlertsService } from 'app/services';
import {Subscription} from 'rxjs/Subscription';
import { AppConstant } from "../../../../app.constants";

@Component({
	selector: 'app-widget-alert-b',
	templateUrl: './widget-alert-b.component.html',
	styleUrls: ['./widget-alert-b.component.css']
})
export class WidgetAlertBComponent implements OnInit {
	@Input() widget;
	@Input() resizeEvent: EventEmitter<any>;
	@Input() alertLimitchangeEvent: EventEmitter<any>;
	resizeSub: Subscription;
	limitChangeSub: Subscription;
	alerts: any = [];
	topproduct = [];
	message: any;
	mediaUrl = "";
	currentUser = JSON.parse(localStorage.getItem('currentUser'));
	constructor(
		public dashboardService: DashboardService,
		private spinner: NgxSpinnerService,
		private _notificationService: NotificationService,
		private changeDetector : ChangeDetectorRef,
		public _service: AlertsService,
		public _appConstant: AppConstant,
		){
		this.mediaUrl = this._notificationService.apiBaseUrl;
	}

	ngOnInit() {
		this.resizeSub = this.resizeEvent.subscribe((widget) => {
		});
		this.limitChangeSub = this.alertLimitchangeEvent.subscribe((limit) => {
			this.getinventoryconsumptionbyproduct();
		});
		this.getinventoryconsumptionbyproduct();
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
	 		if (this.changeDetector && !(this.changeDetector as ViewRef).destroyed) {
	 			this.changeDetector.detectChanges();
	 		}
	 	}, error => {
	 		this.spinner.hide();
	 		this._notificationService.add(new Notification('error', error));
	 	});
	 }

	 getLocalDate(lDate) {
	 	var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
	 	// Get the local version of that date
	 	var localDate = moment(utcDate).local();
	 	let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
	 	return res;
	 }

	 getPercent(totalAvalableQty,totalCapacity){
	 	if(totalCapacity==0){
	 		if(totalAvalableQty==0){
	 			return (100);
	 		}
	 	}
	 	let per=(totalAvalableQty*100)/totalCapacity;
	 	return(per);
	 }

	 ngOnDestroy() {
	 	this.resizeSub.unsubscribe();
	 	this.limitChangeSub.unsubscribe();
	 }
	}
