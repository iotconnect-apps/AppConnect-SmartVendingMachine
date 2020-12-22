import { ChangeDetectorRef, ViewRef , OnInit, Component, Input, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner'
import { DashboardService } from 'app/services/dashboard/dashboard.service';
import { Notification, NotificationService } from 'app/services';
import { Subscription } from 'rxjs/Subscription';
import { AgmMap} from '@agm/core';


@Component({
	selector: 'app-widget-map-a',
	templateUrl: './widget-map-a.component.html',
	styleUrls: ['./widget-map-a.component.css']
})
export class WidgetMapAComponent implements OnInit, OnDestroy {
	searchParameters = {
		pageNumber: 0,
		pageNo: 0,
		pageSize: 10,
		searchText: '',
		sortBy: 'uniqueId asc'
	  };
	lat = 32.897480;
	lng = -97.040443;
	@Input() widget;
	@Input() count;
	@Input() resizeEvent: EventEmitter<any>;
	@Input() zoomChangeEvent: EventEmitter<any>;
	resizeSub: Subscription;
	zoomSub: Subscription;

	@ViewChild(AgmMap,{static:false}) myMap : any;
	mapHeight = '300px';
	locationList = [];
	constructor(
		public dashboardService: DashboardService,
		private spinner: NgxSpinnerService,
		private _notificationService: NotificationService,
		private changeDetector: ChangeDetectorRef,
		) {
	}

	ngOnInit() {
		this.mapHeight = (this.widget.properties.h > 0 ? parseInt((this.widget.properties.h - 55).toString())+'px' : this.mapHeight);
		this.widget.widgetProperty.zoom = (this.widget.widgetProperty.zoom && this.widget.widgetProperty.zoom > 0 ? parseInt(this.widget.widgetProperty.zoom) : 10);
		this.resizeSub = this.resizeEvent.subscribe((widget) => {
			if(widget.id == this.widget.id){
				this.widget = widget;
				this.resizeMap();
			}
		});
		this.zoomSub = this.zoomChangeEvent.subscribe((widget) => {
			if(widget && widget.id == this.widget.id){
				this.widget = widget; 
				this.resizeMap();
			}
		});
		this.resizeMap();
		this.getLocationList()
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
        this.locationList = response.data.items
        this.resizeMap();
		if(response.data.items.length > 0 && response.data.items[0].latitude && response.data.items[0].longitude && response.data.items[0].latitude != '' && response.data.items[0].longitude != ''){
			let newCenter = {
				lat: parseFloat(response.data.items[0].latitude),
				lng: parseFloat(response.data.items[0].longitude),
		    };
			var $reference  = this;
	    	(this.myMap as any)._mapsWrapper.triggerMapEvent('resize').then(() => {
	          ($reference.myMap as any)._mapsWrapper.setCenter(newCenter);
	        });
		}
		if (this.changeDetector && !(this.changeDetector as ViewRef).destroyed) {
			this.changeDetector.detectChanges();
		}
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

	resizeMap(){
		this.mapHeight = (this.widget.properties.h > 0 ? parseInt((this.widget.properties.h - 55).toString())+'px' : this.mapHeight);
		if(this.myMap){
			this.myMap.triggerResize();
		}
	}

	ngOnDestroy() {
		this.resizeSub.unsubscribe();
		this.zoomSub.unsubscribe();
	}
}
