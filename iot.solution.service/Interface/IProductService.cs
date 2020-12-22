using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Response = iot.solution.entity.Response;

namespace iot.solution.service.Interface
{
    public interface IProductService
    {
      
        Entity.Product Get(Guid id);
        Entity.ActionStatus Manage(Entity.ProductModel request);
        Entity.ActionStatus Delete(Guid id);
        Entity.ActionStatus DeleteImage(Guid id);
        Entity.SearchResult<List<Entity.ProductDetail>> List(Entity.SearchRequest request);       
        Entity.BaseResponse<Entity.DashboardOverviewResponse> GetProductDetail(Guid productId, DateTime? CurrentDate, string TimeZone);

    }
}
