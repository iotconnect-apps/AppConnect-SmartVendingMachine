import { ChangeDetectorRef, ViewRef , OnInit, Component, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner'
import { DashboardService } from 'app/services/dashboard/dashboard.service';
import { Notification, NotificationService } from 'app/services';
import {Subscription} from 'rxjs/Subscription';
import { ChartReadyEvent, GoogleChartComponent } from 'ng2-google-charts'

@Component({
	selector: 'app-widget-chart-a',
	templateUrl: './widget-chart-a.component.html',
	styleUrls: ['./widget-chart-a.component.css']
})
export class WidgetChartAComponent implements OnInit,OnDestroy {
	@Input() widget;
	@Input() gridster;
	@Input() count;
	@Input() resizeEvent: EventEmitter<any>;
	resizeSub: Subscription;
	@Input() chartTypeChangeEvent: EventEmitter<any>;
	chartTypeChangeSub: Subscription;

	@ViewChild('cchart', { static: false }) cchart: GoogleChartComponent;
	currentUser = JSON.parse(localStorage.getItem("currentUser"));
	bgColor = ['#5496d0'];
	columnChart = {
		chartType: 'ColumnChart',
		dataTable: [],
		options: {
			width:200,
			height:200,
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
			seriesType: 'bars',
			bar: { groupWidth: "25%" },
			colors: ["#5496d0"]
		}
	};
	constructor(
		public dashboardService: DashboardService,
		private spinner: NgxSpinnerService,
		private _notificationService: NotificationService,
		private changeDetector : ChangeDetectorRef,
		){
	}

	ngOnInit() {
		if(this.widget.widgetProperty.chartColor.length > 0){
			this.columnChart.options.colors = [];
			for (var i = 0; i <= (this.widget.widgetProperty.chartColor.length - 1); i++) {
				this.columnChart.options.colors.push(this.widget.widgetProperty.chartColor[i].color);
			}
		} 
		this.columnChart.options.width = (this.widget.properties.w > 0 ? parseInt((this.widget.properties.w - 30).toString()) : 200);
		this.columnChart.options.height = (this.widget.properties.h > 0 ? parseInt((this.widget.properties.h - 95).toString()) : 200);
		this.resizeSub = this.resizeEvent.subscribe((widget) => {
			if(widget.id == this.widget.id){
				this.widget = widget;
				this.changeChartType();
			}
		});

		this.chartTypeChangeSub = this.chartTypeChangeEvent.subscribe((widget) => {
			if(widget.id == this.widget.id){
				this.changeChartType();
			}
		});
		this.changeChartType(); 
		this.getinventorystatus();
	}

	/**
	 * Get Inventory Status graph
	 * */
	 getinventorystatus() {
	 	this.spinner.show();
	 	let data = {
	 		"companyGuid":this.currentUser.userDetail.companyId
	 	}
	 	this.columnChart.dataTable = []
	 	this.dashboardService.getinventorystatus(data).subscribe(response => {
	 		this.spinner.hide();
	 		if (response.isSuccess === true) {
 				if (response.data.length) {
					this.columnChart.dataTable.push(['Months', 'Consumption']);
				}
				response.data.forEach((element,index) => {
					this.columnChart.dataTable.push([element.deviceName, parseFloat(element.totalAvailableQty)]);
					if(index == (response.data.length - 1)){
						this.changeChartType();
					}
				});
				if (this.changeDetector && !(this.changeDetector as ViewRef).destroyed) {
					this.changeDetector.detectChanges();
				}
	 		}
	 		if (this.changeDetector && !(this.changeDetector as ViewRef).destroyed) {
	 			this.changeDetector.detectChanges();
	 		}
	 	}, error => {
	 		this.columnChart.dataTable = [];
	 		this.spinner.hide();
	 		this._notificationService.add(new Notification('error', error));
	 	});
	 }

	 changeChartType(){
	 	if(this.widget.widgetProperty.chartColor.length > 0){
	 		this.columnChart.options.colors = [];
	 		for (var i = 0; i <= (this.widget.widgetProperty.chartColor.length - 1); i++) {
	 			this.columnChart.options.colors.push(this.widget.widgetProperty.chartColor[i].color);
	 		}
	 	}
	 	this.columnChart.options.width = (this.widget.properties.w > 0 ? parseInt((this.widget.properties.w - 30).toString()) : 200);
	 	this.columnChart.options.height = (this.widget.properties.h > 0 ? parseInt((this.widget.properties.h - 95).toString()) : 200);
	 	this.columnChart.chartType = 'ColumnChart';
	 	if(this.widget.widgetProperty.chartType && this.widget.widgetProperty.chartType != ''){
	 		this.columnChart.chartType = (this.widget.widgetProperty.chartType == 'bar' ? 'ColumnChart' : 'ColumnChart');
	 		if(this.columnChart.dataTable.length > 1 && this.cchart){
	 			let ccWrapper = this.cchart.wrapper;
	 			ccWrapper.setChartType(this.columnChart.chartType);
	 			this.cchart.draw();
	 			ccWrapper.draw();
	 		}
	 		if (this.changeDetector && !(this.changeDetector as ViewRef).destroyed) {
	 			this.changeDetector.detectChanges();
	 		}
	 	}
	 }

	 ngOnDestroy() {
	 	this.resizeSub.unsubscribe();
	 	this.chartTypeChangeSub.unsubscribe();
	 }
	}
