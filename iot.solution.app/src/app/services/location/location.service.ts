import 'rxjs/add/operator/map'

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { ApiConfigService, NotificationService } from 'app/services';
import * as moment from 'moment'
@Injectable({
	providedIn: 'root'
})

export class LocationService {
	cookieName = 'FM';
	protected apiServer = ApiConfigService.settings.apiServer;
	constructor(
		private cookieService: CookieService,
		private httpClient: HttpClient,
		private _notificationService: NotificationService
	) {
		this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  getentitydevices(entityId) {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/dashboard/getentitydevices/' + entityId).map(response => {
      return response;
    });
  }

  changeLocationStatus(locationId, isActive) {
    let status = isActive == true ? false : true;
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/entity/updatestatus/' + locationId + '/' + status, {}).map(response => {
      return response;
    });
  }

  deleteLocation(locationGuid) {

    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/entity/delete/' + locationGuid, "").map(response => {
      return response;
    });
  }

  removeLocationImage(entityId) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/entity/deleteimage/' + entityId, {}).map(response => {
      return response;
    });
  }

  getcountryList() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/country').map(response => {
      return response;
    });
  }

  getstatelist(countryId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/state/' + countryId).map(response => {
      return response;
    });
  }
  getLocationlookup(companyId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/entitylookup/' + companyId).map(response => {
      return response;
    });

  }
  getEnergyGraph(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getenergyusage', data).map(response => {
      return response;
    });
  }
  getPredictionGraph(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getinventoryconsumptionprediction', data).map(response => {
      return response;
    });
  }
  getInventoryGraph(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getinventoryconsumption', data).map(response => {
      return response;
    });
  }
  getLocatinDetails(locationGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/entity/' + locationGuid).map(response => {
      return response;
    });
  }
  getentitydetail(locationGuid) {
	let currentDate=moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');
    var timeZone = moment().utcOffset();
    var path='api/dashboard/getentitydetail/'+locationGuid+'?currentDate='+currentDate+'&timeZone='+timeZone;
    return this.httpClient.get<any>(this.apiServer.baseUrl +path).map(response => {
      return response;
	});
	

    // return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/dashboard/getentitydetail/' + locationGuid).map(response => {
    //   return response;
    // });
  }

  getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }


  addLocation(data) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (data[key])
        formData.append(key, value);
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/entity/manage', formData).map(response => {
      return response;
    });
  }

  getLocationlist(parameters) {
    const parameter = {
      params: {
        'pageNo': parameters.pageNo + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.orderBy
      },
      timestamp: Date.now()
    };
    var configHeader = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
      }
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/entity/search', parameter).map(response => {
      return response;
    });
  }

	getGatewayLookup() {

		return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/gateway').map(response => {

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
	getkittypes() {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json'
			}
		};

		return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/kittype', configHeader).map(response => {

			return response;
		});
	}
	addUpdateHardwarekit(data) {

		return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/hardwarekit/manage', data).map(response => {
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

	getLocationdetail(loactionId) {
		var configHeader = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.cookieService.get(this.cookieName + 'access_token')
			}
		};

		return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/location/' + loactionId, configHeader).map(response => {
			return response;
		});
	}

}
