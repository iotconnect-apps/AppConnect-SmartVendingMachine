import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DashboardService, NotificationService,Notification,DeviceService, LocationService } from 'app/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConstant } from 'app/app.constants';
import * as moment from 'moment-timezone'
import * as FileSaver from 'file-saver';
import { StompRService } from '@stomp/ng2-stompjs'
import { Message } from '@stomp/stompjs'
import { Subscription } from 'rxjs'
import { Observable, forkJoin } from 'rxjs';
import * as _ from 'lodash'
import { ActivatedRoute } from '@angular/router';
import 'chartjs-plugin-streaming';


@Component({
  selector: 'app-vending-machine-dashboard',
  templateUrl: './vending-machine-dashboard.component.html',
  styleUrls: ['./vending-machine-dashboard.component.css'],
  providers: [StompRService]
})
export class VendingMachineDashboardComponent implements OnInit {
  WidgetData: any={}
  objdetailref: any = {}
  productList = [];
  alerts = [];
  topproduct = [];
  deviceIsConnected = false;
  uniqueId: any;
  isConnected = false;
  subscription: Subscription;
  messages: Observable<Message>;
  cpId = '';
  subscribed;
  columnChartattribute = {
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
      colors: ['#ed734c'],
    }
  };
  smallWidgetData: any[] = [
    {
      smallWidgetValue: '25',
      smallWidgetTitle: 'Temperature'
    },
    {
      smallWidgetValue: '4.9',
      smallWidgetTitle: 'Humidity'
    },
    {
      smallWidgetValue: '200',
      smallWidgetTitle: 'Vibration'
    },

  ];
  maintenanceSchescheduled: any;
  stompConfiguration = {
    url: '',
    headers: {
      login: '',
      passcode: '',
      host: ''
    },
    heartbeat_in: 0,
    heartbeat_out: 2000,
    reconnect_delay: 5000,
    debug: true
  }
  chartColors: any = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    cerise: 'rgb(255,0,255)',
    popati: 'rgb(0,255,0)',
    dark: 'rgb(5, 86, 98)',
    solid: 'rgb(98, 86, 98)',
    tenwik: 'rgb(13, 108, 179)',
    redmek: 'rgb(143, 25, 85)',
    yerows: 'rgb(249, 43, 120)',
    redies: 'rgb(225, 208, 62)',
    orangeies: 'rgb(225, 5, 187)',
    yellowies: 'rgb(74, 210, 80)',
    greenies: 'rgb(74, 210, 165)',
    blueies: 'rgb(128, 96, 7)',
    purpleies: 'rgb(8, 170, 196)',
    greyies: 'rgb(122, 35, 196)',
    ceriseies: 'rgb(243, 35, 196)',
    popatiies: 'rgb(243, 35, 35)',
    darkies: 'rgb(87, 17, 35)',
    solidies: 'rgb(87, 71, 35)',

  };
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
      height: "350",
      chartArea: { height: '75%', width: '85%' },
      seriesType: 'bars',
      bar: { groupWidth: "25%" },
      colors: ['#5496d0'],
    }
  };
  locations = [
    { value: 'orlando', viewValue: 'Orlando' },
    { value: 'florida', viewValue: 'Florida' },
    { value: 'hawaii', viewValue: 'Hawaii' }
  ];
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
      height: "340",
      chartArea: {height: '75%', width: '85%'},
      seriesType: 'bars',
      bar: { groupWidth: "25%" },
      colors: ['#5496d0'],
    }
  };
  sensdata:any = [];
  datasets: any[] = [
    {
      label: 'Dataset 1 (linear interpolation)',
      backgroundColor: 'rgb(153, 102, 255)',
      borderColor: 'rgb(153, 102, 255)',
      fill: false,
      lineTension: 0,
      borderDash: [8, 4],
      data: []
    }
  ];
  optionsdata: any = {
    type: 'line',
    scales: {

      xAxes: [{
        type: 'realtime',
        time: {
          stepSize: 10
        },
        realtime: {
          duration: 90000,
          refresh: 1000,
          delay: 2000,
          //onRefresh: '',

          // delay: 2000

        }

      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]

    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }

  };
  vendingGuid: any;
  type: string;
  maintenanceDate: any;
  labelname: any;
  typedata:any;
  typeinven: string;
  message: any;
  mediaUrl: string;
  inventorylabelname: any;
  productId: any;
  deviceuniqueId: any;
  constructor(public _appConstant: AppConstant,public locationservice:LocationService,public location: Location,private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute,
    private _notificationService: NotificationService,private deviceService: DeviceService, 
    private stompService: StompRService,public dashboardService: DashboardService) { 
      this.mediaUrl = this._notificationService.apiBaseUrl;
      this.activatedRoute.params.subscribe(params => {
        if (params.deviceGuid) {
          this.getvedingDetails(params.deviceGuid);
          this.vendingGuid = params.deviceGuid;
          this.getAlertList(params.deviceGuid);
          this.gettelemetryDetails(params.deviceGuid);
          //this.getMaintenanceList(params.refrigeratorGuid);
          this.getUpcomingMaintenancedate(params.deviceGuid);
          this.getinventoryconsumptionbyproduct(params.deviceGuid)
        } 
      });
    }

  ngOnInit() {
    this.inventorylabelname = 'Inventory';
    let type = 'w';
    this.type = type
    let typeinven = 'w';
    this.typeinven = typeinven
    this.getsensorTelemetryData()
    this.getEnergyGraph(this.vendingGuid, type)
    this.getInventoryGraph(this.vendingGuid, typeinven)
    this.getProductlookup(this.vendingGuid)
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

  getLocalDate(lDate) {
    var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
    // Get the local version of that date
    var localDate = moment(utcDate).local();
    let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    return res;

  }
  getProductlookup(vedingGuid) {
    this.deviceService.getProductLookup(vedingGuid).subscribe(response => {
      if (response.isSuccess === true ) {
        this.productList = response.data
        if(response.data != ''){
        this.productId = response.data[0].value
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
  gettelemetryDetails(vedingGuid) {
    this.deviceService.gettelemetryDetails(vedingGuid).subscribe(response => {
      if (response.isSuccess === true && response.data != '') {
        //this.sensdata = response.data
        let attrObj = {};
        response.data.forEach(element => {
          if (element.attributeName) {
            attrObj[element.attributeName] = element.attributeValue;
          }
        });
        this.WidgetData = attrObj;
        
      }
      else {
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  getinventoryconsumptionbyproduct(vedingGuid) {
    this.spinner.show();
    let data = {
      "deviceGuid":vedingGuid,
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
  changeGraphInventory(event) {
    let typeinven = 'w';
    if (event.value === 'Week') {
      typeinven = 'w';
    } else if (event.value === 'Month') {
      typeinven = 'm';
    }
    this.typeinven = typeinven
    this.getInventoryGraph(this.vendingGuid, typeinven);
  
  }
  changeGraphFilter(event) {
    let type = 'w';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.type = type
    this.getEnergyGraph(this.vendingGuid, type);

  }

  getAlertList(refGuid) {
    let parameters = {
      pageNumber: 0,
      pageSize: 20,
      searchText: '',
      sortBy: 'eventDate desc',
      deviceGuid: refGuid,
      entityGuid: '',
    };
    this.spinner.show();
    this.dashboardService.getAlertsList(parameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true && response.data.items) {
        this.alerts = response.data.items;

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
  getvedingDetails(vendingGuid) {
    this.spinner.show();
    this.deviceService.getDeviceDetails(vendingGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
       this.objdetailref = response.data;
       //this.mediaUrl = this.imgUrl + this.objdetailref.image;
       this.uniqueId = response.data.uniqueId
       this.getStompConfig();
       let type = 'w';
       this.type = type;
       //this.mediaFiles = response.data.deviceMediaFiles
       //this.imagesFiles = response.data.deviceImageFiles
       this.devicestatus();
      }
    });
  }
  devicestatus() {
    this.dashboardService.connectionstatus(this.uniqueId).subscribe(response => {
      if (response.isSuccess === true && response.data != '') {
        this.deviceIsConnected = response.data.isConnected
      }
    })
  }
  getStompConfig() {

    this.deviceService.getStompConfig('LiveData').subscribe(response => {
      if (response.isSuccess) {
        this.stompConfiguration.url = response.data.url;
        this.stompConfiguration.headers.login = response.data.user;
        this.stompConfiguration.headers.passcode = response.data.password;
        this.stompConfiguration.headers.host = response.data.vhost;
        this.cpId = response.data.cpId;
        this.initStomp();
      }
    });
  }
  initStomp() {
    let config = this.stompConfiguration;
    this.stompService.config = config;
    this.stompService.initAndConnect();
    this.stompSubscribe();
  }
  public stompSubscribe() {
    if (this.subscribed) {
      return;
    }

    this.messages = this.stompService.subscribe('/topic/' + this.cpId + '-' + this.uniqueId);
    this.subscription = this.messages.subscribe(this.on_next);
    this.subscribed = true;
  }
  public on_next = (message: Message) => {
    let obj: any = JSON.parse(message.body);
    let reporting_data = obj.data.data.reporting
    this.isConnected = true;

    let dates = obj.data.data.time;
    let now = moment();
    if (obj.data.data.status == undefined && obj.data.msgType == 'telemetry' && obj.data.msgType != 'device' && obj.data.msgType != 'simulator') {
      this.deviceIsConnected = true;
      this.optionsdata = {
        type: 'line',
        scales: {

          xAxes: [{
            type: 'realtime',
            time: {
              stepSize: 5
            },
            realtime: {
              duration: 90000,
              refresh: 6000,
              delay: 2000,
              onRefresh: function (chart: any) {
                if (chart.height) {
                  if (obj.data.data.status != 'on') {
                    chart.data.datasets.forEach(function (dataset: any) {

                      dataset.data.push({

                        x: now,

                        y: reporting_data[dataset.label]

                      });

                    });
                  }
                } else {

                }

              },

              // delay: 2000

            }

          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'value'
            }
          }]

        },
        tooltips: {
          mode: 'nearest',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: false
        }

      }
    } else if (obj.data.msgType === 'simulator' || obj.data.msgType === 'device') {
      if (obj.data.data.status === 'off') {
        this.deviceIsConnected = false;
        this.optionsdata = {
        type: 'line',
    scales: {

      xAxes: [{
        type: 'realtime',
        time: {
          stepSize: 10
        },
        realtime: {
          duration: 90000,
          refresh: 1000,
          delay: 2000,
          //onRefresh: '',

          // delay: 2000

        }

      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]

    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }

  };
      } else {
        this.deviceIsConnected = true;
      }
    }
    obj.data.data.time = now;

  }
  getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }
  getUpcomingMaintenancedate(vendingGuid) {
    let currentdatetime = moment().format('YYYY-MM-DD[T]HH:mm:ss');
    let timezone = moment().utcOffset();
      this.deviceService.getUpcomingMaintenancedate(vendingGuid,currentdatetime,timezone).subscribe(response => {
        if (response.isSuccess === true) {
          this.maintenanceDate = response.data.startDateTime;
          this.deviceuniqueId = response.data.uniqueId;
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
    getEnergyGraph(deviceGuid, type) {
      this.spinner.show();
      var data = { deviceGuid: deviceGuid, frequency: type }
      this.locationservice.getEnergyGraph(data).subscribe(response => {
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
              bar: { groupWidth: '25%' },
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
    getInventoryGraph(vedingId, type) {
      this.spinner.show();
      var object = { deviceGuid: vedingId, frequency: type };
      if(this.inventorylabelname == 'Inventory'){
        var data = { deviceGuid: vedingId, frequency: type }
      }else{
         data = Object.assign({ productGuid: this.productId }, object);
       // var data = { deviceGuid: vedingId, frequency: type ,productGuid:''}
      }
      this.locationservice.getInventoryGraph(data).subscribe(response => {
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
              height: "350",
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
  getsensorTelemetryData() {
    this.spinner.show();
    this.dashboardService.getsensorTelemetryData().subscribe(response => {
      if (response.isSuccess === true) {
        this.spinner.hide();
        this.sensdata = response.data
        let type = 'w';
        this.typedata = type;
        this.labelname = response.data[0].text;
        this.getAttributeGraph(this.vendingGuid, type, response.data[0].text);
        let temp = [];
        response.data.forEach((element, i) => {
          var colorNames = Object.keys(this.chartColors);
          var colorName = colorNames[i % colorNames.length];
          var newColor = this.chartColors[colorName];
          var graphLabel = {
            label: element.text,
            backgroundColor: 'rgb(153, 102, 255)',
            borderColor: newColor,
            fill: false,
            cubicInterpolationMode: 'monotone',
            data: []
          }
          temp.push(graphLabel);
        });
        this.datasets = temp;
      } else {
        if (response.message) {

          this._notificationService.add(new Notification('error', response.message));
        }
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  

  inventorychange(tab) {
    if (tab != undefined && tab != '') {
      this.inventorylabelname = tab.tab.textLabel;
      this.getInventoryGraph(this.vendingGuid, this.typeinven)
    }
  }
  onTabChange(tab) {
    if (tab != undefined && tab != '') {
      this.labelname = tab.tab.textLabel;
      this.getAttributeGraph(this.vendingGuid, this.typedata, tab.tab.textLabel)
    }
  }
   /**
   * Change graph attribute 
   * @param event
   */
  changeGraphAttribute(event) {
    let type = 'w';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.typedata = type
    this.getAttributeGraph(this.vendingGuid, type, this.labelname)
  }
  getAttributeGraph(vendingGuid, type, attributename) {
   // this.isChartLoaded = false;
    var data = { deviceGuid: vendingGuid, attribute: attributename, frequency: type }
    this.deviceService.getAttributeGraph(data).subscribe(response => {
      if (response.isSuccess === true) {
        let data = [];
        if (response.data.length) {
          data.push(['Months', 'Consumption'])

          response.data.forEach(element => {
            data.push([element.name, parseFloat(element.value)])
          });
        }
        this.columnChartattribute = {
          chartType: "ColumnChart",
          dataTable: data,
          options: {
            title: "",
            vAxis: {
              title: "",
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
            colors: ['#ed734c'],
          }
        };
        setTimeout(() => {
          //this.isChartLoaded = true;
        }, 200);
      }
    
      else {
        this.columnChartattribute.dataTable = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.columnChartattribute.dataTable = [];
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  SetProduct(productValue) {
    this.productId = productValue;
    this.getInventoryGraph(this.vendingGuid, this.typeinven)
  }
}
