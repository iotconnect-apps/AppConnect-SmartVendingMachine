using host.iot.solution.Filter;
using iot.solution.entity;
using iot.solution.entity.Structs.Routes;

using iot.solution.service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;

namespace host.iot.solution.Controllers
{
    [Route(InventoryRoute.Route.Global)]
    [ApiController]
    public class InventoryController : BaseController
    {

        private readonly IInventoryService _inventoryService;
        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet]
        [Route(InventoryRoute.Route.GetById, Name = InventoryRoute.Name.GetById)]
        [EnsureGuidParameterAttribute("id", "Inventory")]
        public Entity.BaseResponse<Entity.InventoryDetail> Get(string id)
        {
            if (id == null || id == string.Empty)
            {
                return new Entity.BaseResponse<Entity.InventoryDetail>(false, "Invalid Request");
            }

            Entity.BaseResponse<Entity.InventoryDetail> response = new Entity.BaseResponse<Entity.InventoryDetail>(true);
            try
            {
                response.Data = _inventoryService.Get(Guid.Parse(id));

            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.InventoryDetail>(false, ex.Message);
            }
            return response;
        }

        [ProducesResponseType(typeof(Guid), (int)System.Net.HttpStatusCode.OK)]
        [HttpPost]
        [Route(InventoryRoute.Route.Manage, Name = InventoryRoute.Name.Manage)]
        public Entity.BaseResponse<Guid> Manage(Entity.Inventory request)
        {
            Entity.BaseResponse<Guid> response = new Entity.BaseResponse<Guid>(true);
            try
            {
                var status = _inventoryService.Manage(request);
                response.IsSuccess = status.Success;
                response.Message = status.Message;
                response.Data = status.Data;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Guid>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(InventoryRoute.Route.GetHistory, Name = InventoryRoute.Name.GetHistory)]
        [EnsureGuidParameterAttribute("deviceItemGuid", "Inventory")]
        public Entity.BaseResponse<Entity.InventoryHistoryDetail> GetHistory(string deviceItemGuid)
        {
            Entity.BaseResponse<Entity.InventoryHistoryDetail> response = new Entity.BaseResponse<Entity.InventoryHistoryDetail>(true);
            try
            {
                response.Data = _inventoryService.HistoryDetail(Guid.Parse(deviceItemGuid));
            }
            catch (Exception ex)
            {
                return new Entity.BaseResponse<Entity.InventoryHistoryDetail>(false, ex.Message);
            }
            return response;
        }

        [ProducesResponseType(typeof(bool), (int)System.Net.HttpStatusCode.OK)]
        [HttpPut]
        [Route(InventoryRoute.Route.ClearShelf, Name = InventoryRoute.Name.ClearShelf)]
        [EnsureGuidParameterAttribute("inventoryId", "Inventory")]
        public Entity.BaseResponse<bool> ClearShelf(string inventoryId)
        {
            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                var status = _inventoryService.ClearShelf(Guid.Parse(inventoryId));
                response.IsSuccess = status.Success;
                response.Message = status.Message;
                response.Data = status.Success;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<bool>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(InventoryRoute.Route.BySearch, Name = InventoryRoute.Name.BySearch)]
        public Entity.BaseResponse<Entity.SearchResult<List<Entity.InventoryDetail>>> GetBySearch(string entityId,string deviceId,string productId, string productTypeGuid,string searchText = "", int? pageNo = 1, int? pageSize = 10, string orderBy = "")
        {
            Entity.BaseResponse<Entity.SearchResult<List<Entity.InventoryDetail>>> response = new Entity.BaseResponse<Entity.SearchResult<List<Entity.InventoryDetail>>>(true);
            try
            {
                response.Data = _inventoryService.List(new Entity.SearchRequest()
                {
                    EntityId = string.IsNullOrEmpty(entityId) ? Guid.Empty : new Guid(entityId),
                    Guid = string.IsNullOrEmpty(deviceId) ? null : deviceId,
                    ProductTypeGuid = string.IsNullOrEmpty(productTypeGuid) ? Guid.Empty : new Guid(productTypeGuid),
                    ProductId = string.IsNullOrEmpty(productId) ? Guid.Empty : new Guid(productId),
                    SearchText = searchText,
                    PageNumber = pageNo.Value,
                    PageSize = pageSize.Value,
                    OrderBy = orderBy
                });
            }
            catch (Exception ex)
            {
                return new Entity.BaseResponse<Entity.SearchResult<List<Entity.InventoryDetail>>>(false, ex.Message);
            }
            return response;
        }

    }
}