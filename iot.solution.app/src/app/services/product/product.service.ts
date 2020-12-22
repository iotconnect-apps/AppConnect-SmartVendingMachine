import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import 'rxjs/add/operator/map'
import { NotificationService, ApiConfigService } from '..';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  protected apiServer = ApiConfigService.settings.apiServer;

  constructor(
    private httpClient: HttpClient,
    private _notificationService: NotificationService) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  /**
   * Get product type
   * @param type
   */
  getProductType(type) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/' + type).map(response => {
      return response;
    });

  }

  /**
   * Remove product image by productId
   * @param productId
   */
  removeImage(productId) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/product/deleteimage/' + productId, {}).map(response => {
      return response;
    });
  }

  /**
  * Add product
  * @param data
  */
  addProduct(data) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (data[key])
        formData.append(key, value);
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/product/manage', formData).map(response => {
      return response;
    });
  }

  /**
 * Get product detail by productGuid
 * @param productGuid
 */
  getProductDetails(productGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/product/' + productGuid).map(response => {
      return response;
    });
  }

  /**
  * Get list of product
  * @param parameters
  */
  getProductList(parameters) {

    const reqParameter = {
      params: {
        'parentEntityGuid': parameters.parentEntityGuid,
        'pageNo': parameters.pageNumber + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy
      },
      timestamp: Date.now()
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/product/search', reqParameter).map(response => {
      return response;
    });
  }

  /**
   * Delete product by ProductGuid
   * @param ProductGuid
   */
  deleteProduct(ProductGuid) {

    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/product/delete/' + ProductGuid, "").map(response => {
      return response;
    });
  }

  /**
   * Get product lookup by productTypeId
   * @param productTypeId
   */
  getProductLookup(productTypeId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/productlookup/' + productTypeId).map(response => {
      return response;
    });

  }
}


