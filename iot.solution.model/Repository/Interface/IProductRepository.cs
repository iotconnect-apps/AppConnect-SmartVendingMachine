using iot.solution.entity;
using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;

namespace iot.solution.model.Repository.Interface
{
    public interface IProductRepository : IGenericRepository<Model.Product>
    {
        Entity.SearchResult<List<Entity.ProductDetail>> List(Entity.SearchRequest request);
        List<Entity.LookupItem> GetLookup(Guid companyId);
       
        ActionStatus Manage(Model.Product request);
        Entity.BaseResponse<List<Entity.DashboardOverviewResponse>> GetStatistics(Guid entityId, DateTime? CurrentDate, string TimeZone);
    }
}
