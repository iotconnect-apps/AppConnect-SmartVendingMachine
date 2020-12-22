import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import 'rxjs/add/operator/map'
import { NotificationService, ApiConfigService } from '..';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  protected apiServer = ApiConfigService.settings.apiServer;

  constructor(
    private httpClient: HttpClient,
    private _notificationService: NotificationService) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  /**
 * Get list of inventory
 * @param parameters
 */
  getInventoryList(parameters) {

    const reqParameter = {
      params: {
        'entityId': parameters.entityId,
        'deviceId': parameters.deviceId,
        'productId': parameters.productId,
        'productTypeGuid': parameters.productTypeGuid,
        'pageNo': parameters.pageNo + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.orderBy
      },
      timestamp: Date.now()
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/inventory/search', reqParameter).map(response => {
      return response;
    });
  }

  /**
 * Get list of inventory history
 * @param parameters
 */
  getInventoryHistoryList(deviceItemGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/inventory/gethistory/' + deviceItemGuid).map(response => {
      return response;
    });
  }

  /**
* Get inventory detail by inventoryGuid
* @param inventoryGuid
*/
  getInventoryDetails(inventoryGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/inventory/' + inventoryGuid).map(response => {
      return response;
    });
  }

  /**
   * Add update inventory data
   * @param data
   */
  manageInventory(data) {
    
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/inventory/manage', data).map(response => {
      return response;
    });
  }

  /**
   * Get product type lookup by deviceId
   * @param deviceId
   */
  getProductTypeLookup(deviceId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/productTypelookup/' + deviceId).map(response => {
      return response;
    });

  }

  /**
   * Get ShelfID lookup by deviceId
   * @param deviceId
   */
  getSheflIDLookup(deviceId,productTypeId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/Shelflookup/' + deviceId +'/' + productTypeId).map(response => {
      return response;
    });

  }

  /**
   * Get Shelf capacity by shelfId
   * @param shelfId
   */
  getShelfCapacity(shelfId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/shelfcapacity/' + shelfId ).map(response => {
      return response;
    });

  }

  clearShelf(inventoryId) {

    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/inventory/clearshelf/' + inventoryId, "").map(response => {
      return response;
    });
    
  }

}
