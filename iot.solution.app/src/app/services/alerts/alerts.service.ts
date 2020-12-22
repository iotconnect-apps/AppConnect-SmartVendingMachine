import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService, NotificationService } from 'app/services';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  protected apiServer = ApiConfigService.settings.apiServer;
  cookieName = 'FM';
  constructor(
    private cookieService: CookieService,
    private httpClient: HttpClient,
    private _notificationService: NotificationService) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  removeImage(entityId) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/entity/deleteimage/'+entityId,{}).map(response => {
      return response;
    });
  }

  getAlerts(parameters) {
    const reqParameter = {
      params: {
        pageNo: parameters.pageNo + 1,
        pageSize: parameters.pageSize,
        searchText: parameters.searchText,
        orderBy: parameters.orderBy,
        deviceGuid: parameters.deviceGuid,
        entityGuid: parameters.entityGuid,
      },
      timestamp: Date.now()
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/alert', reqParameter).map(response => {
      return response;
    });
  }
}
