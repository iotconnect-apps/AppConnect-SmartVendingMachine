using host.iot.solution.Filter;
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
    [Route(ProductRoute.Route.Global)]
    [ApiController]
    public class ProductController : BaseController
    {
        private readonly IProductService _service;
       
        public ProductController(IProductService productService, IDeviceService deviceService, ILookupService lookupService)
        {
            _service = productService;           
        }
        [HttpGet]
        [Route(ProductRoute.Route.GetById, Name = ProductRoute.Name.GetById)]
        [EnsureGuidParameterAttribute("id", "Product")]
        public Entity.BaseResponse<Entity.Product> Get(string id)
        {
            if (id == null || id == string.Empty)
            {
                return new Entity.BaseResponse<Entity.Product>(false, "Invalid Request");
            }

            Entity.BaseResponse<Entity.Product> response = new Entity.BaseResponse<Entity.Product>(true);
            try
            {
                response.Data = _service.Get(Guid.Parse(id));
               
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.Product>(false, ex.Message);
            }
            return response;
        }

        [HttpPost]
        [Route(ProductRoute.Route.Manage, Name = ProductRoute.Name.Add)]
        public Entity.BaseResponse<Entity.Product> Manage([FromForm]Entity.ProductModel request)
        {

            Entity.BaseResponse<Entity.Product> response = new Entity.BaseResponse<Entity.Product>(false);
            try
            {

                var status = _service.Manage(request);
                if (status.Success)
                {
                    response.IsSuccess = status.Success;
                    response.Message = status.Message;
                    response.Data = status.Data;
                }
                else
                {
                    response.IsSuccess = status.Success;
                    response.Message = status.Message;
                }

            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.Product>(false, ex.Message);
            }
            return response;
        }

        [HttpPut]
        [Route(ProductRoute.Route.Delete, Name = ProductRoute.Name.Delete)]
        [EnsureGuidParameterAttribute("id", "Product")]
        public Entity.BaseResponse<bool> Delete(string id)
        {
            if (id == null || id == string.Empty)
            {
                return new Entity.BaseResponse<bool>(false, "Invalid Request");
            }

            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                var status = _service.Delete(Guid.Parse(id));
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

        [HttpPut]
        [Route(ProductRoute.Route.DeleteImage, Name = ProductRoute.Name.DeleteImage)]
        [EnsureGuidParameterAttribute("id", "Product")]
        public Entity.BaseResponse<bool> DeleteImage(string id)
        {
            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                var status = _service.DeleteImage(Guid.Parse(id));
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
        [Route(ProductRoute.Route.BySearch, Name = ProductRoute.Name.BySearch)]
        public Entity.BaseResponse<Entity.SearchResult<List<Entity.ProductDetail>>> GetBySearch(string parentEntityGuid = "", string searchText = "", int? pageNo = 1, int? pageSize = 10, string orderBy = "")
        {
            Entity.BaseResponse<Entity.SearchResult<List<Entity.ProductDetail>>> response = new Entity.BaseResponse<Entity.SearchResult<List<Entity.ProductDetail>>>(true);
            try
            {
                response.Data = _service.List(new Entity.SearchRequest()
                {
                    EntityId = string.IsNullOrEmpty(parentEntityGuid) ? Guid.Empty : new Guid(parentEntityGuid),
                    SearchText = searchText,
                    PageNumber =pageNo.Value,
                    PageSize = pageSize.Value,
                    OrderBy = orderBy
                });
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.SearchResult<List<Entity.ProductDetail>>>(false, ex.Message);
            }
            return response;
        }
    }
}