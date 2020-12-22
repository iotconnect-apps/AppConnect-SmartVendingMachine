import 'rxjs/add/operator/map'

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { ApiConfigService, NotificationService } from 'app/services';
import * as moment from 'moment'
@Injectable({
  providedIn: 'root'
})

export class DeviceService {
  cookieName = 'FM';
  protected apiServer = ApiConfigService.settings.apiServer;
  constructor(
    private cookieService: CookieService,
    private httpClient: HttpClient,
    private _notificationService: NotificationService
  ) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }
  getdevices() {
		return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device').map(response => {
			return response;
		});
	}
  getAttributeGraph(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getstatisticsbydevice', data).map(response => {
      return response;
    });
  }
  /**
* Manage Maintenance
* @param data
*/
  scheduleMaintenance(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/devicemaintenance/manage', data).map(response => {
      return response;
    });
  }

  getUpcomingMaintenancedate(vendingId, curdate, timezone) {
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/devicemaintenance/getscheduledMaintenancedate', {
      deviceGuid: vendingId,
      currentDate: curdate,
      timeZone: timezone
    }).map(response => {
      return response;
    });
  }
  gettelemetryDetails(vendingId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/telemetry/' + vendingId).map(response => {
      return response;
    });

  }

  getMaintenancelist(parameters) {
    const reqParameter:any = {
      params: {
        'entityGuid': parameters.entityGuid,
        'deviceId': parameters.deviceId,
        'pageNo': parameters.pageNumber + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy,
        'currentDate':moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
        'timeZone': moment().utcOffset()
      }
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/devicemaintenance/search', reqParameter).map(response => {
      return response;
    });
  }
  getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }
  getProductLookup(id) {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/deviceproductlookup/' + id).map(response => {
      return response;
    });
  }
  getMaintenanceDetails(id) {
    let currentDate=moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');
    var timeZone = moment().utcOffset();
    var path='api/devicemaintenance/'+id+'?currentDate='+currentDate+'&timeZone='+timeZone;
    return this.httpClient.get<any>(this.apiServer.baseUrl + path).map(response => {
      return response;
    });
  }

  /**
   * Get device lookup by subentityId
   * @param subentityId
   */
  getDeviceLookup(subentityId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/devicelookup/' + subentityId).map(response => {
      return response;
    });

  }

  /**
   * Get location lookup by companyId
   * @param companyId
   */
  getLocationlookup(companyId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/entitylookup/' + companyId).map(response => {
      return response;
      // return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/facilitylookup/' + companyId).map(response => {
      //   return response;
    });

  }
  deleteMaintenance(guid) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/devicemaintenance/delete/' + guid, "").map(response => {
      return response;
    });
  }

  getGatewayLookup() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/gateway').map(response => {

      return response;
    });
  }
  getsubcribesyncdata() {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/getlastsyncdetails').map(response => {
      return response;
    });
  }

  getChildDevices(parentID, parameters) {

    const parameter = {
      params: {
        'parentDeviceGuid': parentID,
        'pageNo': parameters.pageNo + 1,
        'pageSize': parameters.pageSize,
        'orderBy': parameters.sortBy
      },
      timestamp: Date.now()
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/childdevicelist', parameter).map(response => {
      return response;
    });
  }

	/**
	 * Delete Hardware kit by guid
	 * @param guid
	 */
  deleteHardwarekit(guid) {


    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/hardwarekit/delete/' + guid, "").map(response => {
      return response;
    });
  }

  deleteDevice(deviceGuid) {


    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/device/delete/' + deviceGuid, "").map(response => {
      return response;
    });
  }

  uploadPicture(deviceGuid, file) {

    const data = new FormData();
    data.append('image', file);

    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/device/' + deviceGuid + '/image', data).map(response => {
      return response;
    });
  }

  getDeviceDetails(deviceGuid) {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/' + deviceGuid).map(response => {
      return response;
    });
  }

  addUpdateDevice(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/device/manage', data).map(response => {
      return response;
    });
  }

  changeStatus(deviceId, isActive) {
    let status = isActive == true ? false : true;
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/device/updatestatus/' + deviceId + '/' + status, {}).map(response => {
      return response;
    });
  }

  getallkittypes() {
    var configHeader = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/alltemplate', configHeader).map(response => {
      return response;
    });
  }

  getkittypes() {
    var configHeader = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/template', configHeader).map(response => {
      return response;
    });
  }

  addUpdateHardwarekit(data, isEdit) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/hardwarekit/manage?isEdit=' + isEdit, data).map(response => {
      return response;
    });
  }

  getHardware(parameters) {
    var configHeader = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const parameter = {
      params: {
        'isAssigned': parameters.isAssigned,
        'pageNo': parameters.pageNo + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy
      },
      timestamp: Date.now()
    };
    var reqParameter = Object.assign(parameter, configHeader);

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/hardwarekit/search', reqParameter).map(response => {
      return response;
    });
  }

  getsubscribers(parameters) {
    var configHeader = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const parameter = {
      params: {
        'pageNo': parameters.pageNo + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy
      },
      timestamp: Date.now()
    };
    var reqParameter = Object.assign(parameter, configHeader);

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/search', reqParameter).map(response => {
      return response;
    });
  }

  getHardwarkitDetails(hardwareGuid) {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/hardwarekit/' + hardwareGuid).map(response => {
      return response;
    });
  }

  uploadFile(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/hardwarekit/verifykit', data).map(response => {
      return response;
    });
  }

  getHardwarkitDownload() {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/hardwarekit/download').map(response => {
      return response;
    });
  }

  getsubscriberDetail(params) {
    var configHeader = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const parameter = {
      params: {
        'userEmail': params.email
      },
      timestamp: Date.now()
    };
    var reqParameter = Object.assign(parameter, configHeader);

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/getsubscriberdetails', reqParameter).map(response => {
      return response;
    });
  }

  getSubscriberKitList(parameters) {
    var configHeader = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const parameter = {
      params: {
        'companyID': parameters.companyID,
        'pageNo': parameters.pageNo + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy
      },
      timestamp: Date.now()
    };
    var reqParameter = Object.assign(parameter, configHeader);

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/getsubscriberkitdetails', reqParameter).map(response => {
      return response;
    });
  }

  uploadData(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/hardwarekit/uploadkit', data).map(response => {
      return response;
    });
  }

  getgeneraters() {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device').map(response => {
      return response;
    });
  }

  addUpdateLocation(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/location/manage', data).map(response => {
      return response;
    });
  }

  getLocationDetails(locationGuid) {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/location/' + locationGuid).map(response => {
      return response;
    });
  }

  addUpdateGenrator(data) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (data[key])
        formData.append(key, value);
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/device/manage', formData).map(response => {
      return response;
    });
  }

  // Get Gateway Count
  checkkitCode(data) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/ValidateKit/' + data).map(response => {
      return response;
    });
  }

  getgenraterDetails(genraterGuid) {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/' + genraterGuid).map(response => {
      return response;
    });
  }

  deletedevice(deviceGuid) {


    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/device/delete/' + deviceGuid, "").map(response => {
      return response;
    });
  }

  changedeviceStatus(deviceId, isActive) {
    let status = isActive == true ? false : true;
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/device/updatestatus/' + deviceId + '/' + status, {}).map(response => {
      return response;
    });
  }

  getDeviceList(parameters) {
    var configHeader = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const parameter = {
      params: {
        'entityGuid': parameters.entityGuid,
        'pageNo': parameters.pageNumber + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy
      },
      timestamp: Date.now()
    };
    var reqParameter = Object.assign(parameter, configHeader);

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/search', reqParameter).map(response => {
      return response;
    });
  }

  getgenraterStatistics(genraterGuid) {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/dashboard/getdevicedetail/' + genraterGuid).map(response => {
      return response;
    });
  }

  getgenraterTelemetryData(templateGuid) {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/devicetags/' + templateGuid).map(response => {
      return response;
    });
  }

  getgenraterMedia(genraterGuid) {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/' + genraterGuid).map(response => {
      return response;
    });
  }

  UploadmediaGenrator(data, genraterGuid) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      formData.append('files', value);
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/device/fileupload/' + genraterGuid, formData).map(response => {
      return response;
    });
  }

  deleteFiles(deviceGuid, fileguid) {


    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/device/deletemediafile/' + deviceGuid + '/' + fileguid, "").map(response => {
      return response;
    });
  }

  //key : UIAlert || LiveData
  getStompConfig(key) {
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/configuration/' + key, '').map(response => {
      return response;
    });
  }
  // Get getWaterUsageChartData
  getFuelUsageChartData(data) {
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getfuelusage', data).map(response => {
      return response;
    });
  }

  // Get Gateway Count
  getEnergyUsageChartData(data) {
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getenergyusage', data).map(response => {
      return response;
    });
  }

  // Get Gateway Count
  getGeneraytorBatteryStatusChartData(data) {
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getdevicebatterystatus', data).map(response => {
      return response;
    });
  }

  // Get Gateway Count
  getGeneraterUsagePieChartData(data) {
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getdeviceusage', data).map(response => {
      return response;
    });
  }
}
