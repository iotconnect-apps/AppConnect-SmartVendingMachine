import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LocationService, Notification,NotificationService, AlertsService, DashboardService, DeviceService } from 'app/services';
import { AppConstant } from 'app/app.constants';
import { MatDialog } from '@angular/material';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment-timezone'
@Component({
  selector: 'app-location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.css']
})
export class LocationDetailsComponent implements OnInit {
  topproduct = [];
  alerts = [];
  locations = [
    { value: 'orlando', viewValue: 'Orlando' },
    { value: 'florida', viewValue: 'Florida' },
    { value: 'hawaii', viewValue: 'Hawaii' }
  ];
  columnChartinvent = {
    chartType: "ColumnChart",
    dataTable: [],
    options: {
      title: "",
      vAxis: {
        title: "KW",
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
      height: "400",
      chartArea: { height: '75%', width: '85%' },
      seriesType: 'bars',
      bar: { groupWidth: "25%" },
      colors: ['#5496d0'],
    }
  };
  columnChart = {
    chartType: "ColumnChart",
    dataTable: [],
    options: {
      title: "",
      vAxis: {
        title: "KW",
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
      colors: ['#5496d0'],
    }
  };
  locationList = [];
  //columnChart: any;
  locationGuid: any;
  locationObj: any = {};
  statisticObj: any ={}
  locationValue: any;
  type: string;
  typeinven: string;
  mediaUrl: string;
  message: any;
  maintenanceDate: any;
  maintenanceSchescheduled: any;
  uniqueId: any;
  constructor(public location: Location, private spinner: NgxSpinnerService,
    private deviceService: DeviceService,
    private dashboardService: DashboardService,
    private alertsService: AlertsService,
    private router: Router,
    public dialog: MatDialog,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    public _appConstant: AppConstant,
    public _service: LocationService) {
      this.mediaUrl = this._notificationService.apiBaseUrl;
      this.activatedRoute.params.subscribe(params => {
        if (params.locationGuid != null) {
          this.locationGuid = params.locationGuid;
          this.getLocationDetails(params.locationGuid);
          this.getEntityStatistics(params.locationGuid)
          this.getAlertList(params.locationGuid);
          this.getUpcomingMaintenancedate(params.locationGuid)
        }
      });
     }

  ngOnInit() {
    this.locationObj = { guid: '' };
    let type = 'w';
    this.type = type
    let typeinven = 'w';
    this.typeinven = typeinven
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationLookup(currentUser.userDetail.companyId)
   // this.columnChartData()
    this.getEnergyGraph(this.locationGuid, type)
    this.getInventoryGraph(this.locationGuid, typeinven)
    this.getinventoryconsumptionbyproduct(this.locationGuid)
  }
  getInventoryGraph(entityId, type) {
    this.spinner.show();
    var data = { entityguid: entityId, frequency: type }
    this._service.getInventoryGraph(data).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        let data = [];
        if (response.data.length) {
          data.push(['Months', 'Consumption'])

          response.data.forEach(element => {
            data.push([element.name, parseFloat(element.consumption)])
          });
        }
        this.columnChartinvent = {
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
            height: "400",
            chartArea: { height: '75%', width: '85%' },
            seriesType: 'bars',
            bar: { groupWidth: "25%" },
            colors: ['#5496d0'],
          }
        };
      }
      else {
        this.columnChartinvent.dataTable = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.columnChartinvent.dataTable = [];
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

  getLocationDetails(locationGuid) {
    this.locationObj = {};
    this.spinner.show();
    this._service.getLocatinDetails(locationGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.locationObj = response.data;
        this.locationObj.guid = this.locationObj.guid.toUpperCase()
      }
    });
  }
  getEntityStatistics(locationGuid) {
    this.spinner.show();
    this._service.getentitydetail(locationGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.statisticObj = response.data;
      }
    });
  }
 /**
 * Get Location Lookup by companyId
 * @param companyId
 */
getLocationLookup(companyId) {
  this._service.getLocationlookup(companyId).
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
getAlertList(locationGuid) {
  this.alerts = [];
  let parameters = {
    pageNo: 0,
    pageSize: 10,
    searchText: '',
    orderBy: 'eventDate desc',
    deviceGuid: '',
    entityGuid: locationGuid,
  };
  this.spinner.show();
  this.alertsService.getAlerts(parameters).subscribe(response => {
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
getLocalDate(lDate) {
  var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
  // Get the local version of that date
  var localDate = moment(utcDate).local();
  let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
  return res;

}
getinventoryconsumptionbyproduct(locationGuid) {
  this.spinner.show();
  let data = {
    "entityGuid":locationGuid,
    "timeZone":moment().utcOffset(),
    "currentDate":moment(new Date()).format('YYYY-MM-DDTHH:mm:ss')
  }
  this.dashboardService.getinventoryconsumptionbyproduct(data).subscribe(response => {
    this.spinner.hide();
    if (response.isSuccess === true) {
     this.topproduct = response.data;
     this.message = response.message;
    }
    else {
      this._notificationService.add(new Notification('error', response.message));
    }
  }, error => {
    this.spinner.hide();
    this._notificationService.add(new Notification('error', error));
  });
}
changeGraphFilter(event) {
  let type = 'w';
  if (event.value === 'Week') {
    type = 'w';
  } else if (event.value === 'Month') {
    type = 'm';
  }
  this.type = type
  this.getEnergyGraph(this.locationGuid, type);

}
changeGraphInventory(event) {
  let typeinven = 'w';
  if (event.value === 'Week') {
    typeinven = 'w';
  } else if (event.value === 'Month') {
    typeinven = 'm';
  }
  this.typeinven = typeinven
  this.getInventoryGraph(this.locationGuid, typeinven);

}
getEnergyGraph(entityId, type) {
  this.spinner.show();
  var data = { entityguid: entityId, frequency: type }
  this._service.getEnergyGraph(data).subscribe(response => {
    this.spinner.hide();
    if (response.isSuccess === true) {
      let data = [];
      if (response.data.length) {
        data.push(['Months', 'Consumption'])

        response.data.forEach(element => {
          data.push([element.name, parseFloat(element.energyConsumption)])
        });
      }
      this.columnChart = {
        chartType: "ColumnChart",
        dataTable: data,
        options: {
          title: "",
          vAxis: {
            title: "KWh",
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
          colors: ['#5496d0'],
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
SetLocation(locationValue) {
  this.locationValue = locationValue;
  this.getLocationDetails(this.locationValue);
  this.getEntityStatistics(this.locationValue)
  this.getAlertList(this.locationValue);
  this.getEnergyGraph(this.locationValue, this.type)
  this.getInventoryGraph(this.locationValue, this.typeinven)
  this.getinventoryconsumptionbyproduct(locationValue)
  this.getUpcomingMaintenancedate(locationValue)
}
getTimeZone() {
  return /\((.*)\)/.exec(new Date().toString())[1];
}
getUpcomingMaintenancedate(locationGuid) {
  let currentdatetime = moment().format('YYYY-MM-DD[T]HH:mm:ss');
  let timezone = moment().utcOffset();
    this.dashboardService.getUpcomingMaintenancedate(locationGuid,currentdatetime,timezone).subscribe(response => {
      if (response.isSuccess === true) {
        this.uniqueId = response.data.uniqueId;
        this.maintenanceDate = response.data.startDateTime;
        let msVal = (response.data['day']) ? response.data['day'] : 0;
        msVal += ' d ';
        msVal += (response.data['hour']) ? response.data['hour'] : 0;
        msVal += ' hrs ';
        msVal += (response.data['minute']) ? response.data['minute'] : 0;
        msVal += ' m';
        this.maintenanceSchescheduled = msVal;
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
onChangepredication(value)
{
  if (value.checked === true) {
    this.getPredictionGraph(this.typeinven)
  }else{
    this.getInventoryGraph(this.locationGuid, this.typeinven);
  }
}
getPredictionGraph(type) {
  this.spinner.show();
  var data = { frequency: type,timeZone:moment().utcOffset(),currentDate:moment(new Date()).format('YYYY-MM-DDTHH:mm:ss') }
  this._service.getPredictionGraph(data).subscribe(response => {
    this.spinner.hide();
    if (response.isSuccess === true) {
      let data = [];
      if (response.data.length) {
        data.push(['Months', 'Consumption'])

        response.data.forEach(element => {
          data.push([element.name, parseFloat(element.consumption)])
        });
      }
      this.columnChartinvent = {
        chartType: "ColumnChart",
        dataTable: data,
        options: {
          title: "",
          vAxis: {
            title: "KW",
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
          height: "400",
          chartArea: { height: '75%', width: '85%' },
          seriesType: 'bars',
          bar: { groupWidth: "25%" },
          colors: ['#5496d0'],
        }
      };
    }
    else {
      this.columnChartinvent.dataTable = [];
      this._notificationService.add(new Notification('error', response.message));

    }
  }, error => {
    this.columnChartinvent.dataTable = [];
    this.spinner.hide();
    this._notificationService.add(new Notification('error', error));
  });
}
}
