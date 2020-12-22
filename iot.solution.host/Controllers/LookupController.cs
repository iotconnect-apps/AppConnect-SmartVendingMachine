using host.iot.solution.Filter;
using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Entity = iot.solution.entity;

namespace host.iot.solution.Controllers
{
    [Route(LookupRoute.Route.Global)]
    public class LookupController : BaseController
    {
        private readonly ILookupService _service;

        public LookupController(ILookupService service)
        {
            _service = service;
        }

        [HttpGet]
        [Route(LookupRoute.Route.Get, Name = LookupRoute.Name.Get)]
        public Entity.BaseResponse<List<Entity.LookupItem>> Get(string type, string param = "")
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {
                response.Data = _service.Get(type, param);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }

        //[HttpGet]
        //[Route(LookupRoute.Route.GetAllTemplate, Name = LookupRoute.Name.GetAllTemplate)]
        //public Entity.BaseResponse<List<Entity.LookupItem>> GetAllTemplate()
        //{
        //    Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
        //    try
        //    {
        //        response.Data = _service.GetAllTemplate();
        //    }
        //    catch (Exception ex)
        //    {
        //        return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
        //    }
        //    return response;
        //}
        [HttpGet]
        [Route(LookupRoute.Route.GetAllTemplateIoT, Name = LookupRoute.Name.GetAllTemplateIoT)]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetAllTemplateFromIoT()
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {
                response.Data = _service.GetAllTemplateFromIoT();
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(LookupRoute.Route.GetAttributesIoT, Name = LookupRoute.Name.GetAttributesIoT)]
        [EnsureGuidParameterAttribute("templateGuid", "Kit Type")]
        public Entity.BaseResponse<List<Entity.KitTypeAttribute>> GetAttributesFromIoT(string templateGuid)
        {
            Entity.BaseResponse<List<Entity.KitTypeAttribute>> response = new Entity.BaseResponse<List<Entity.KitTypeAttribute>>(true);
            try
            {
                response.Data = _service.GetAllAttributesFromIoT(templateGuid);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.KitTypeAttribute>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(LookupRoute.Route.GetCommandsIoT, Name = LookupRoute.Name.GetCommandsIoT)]
        [EnsureGuidParameterAttribute("templateGuid", "Kit Type")]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetAllCommandsFromIoT(string templateGuid)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {
                response.Data = _service.GetAllCommandsFromIoT(templateGuid);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(LookupRoute.Route.GetTemplate, Name = LookupRoute.Name.GetTemplate)]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetTemplate(bool isGateway)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {
                response.Data = _service.GetTemplate(isGateway);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }


       
        //[HttpGet]
        //[Route(LookupRoute.Route.GetSensorsLookup, Name = LookupRoute.Name.GetSensorsLookup)]
        //public Entity.BaseResponse<List<Entity.LookupItem>> GetSensorsLookup(Guid deviceId)
        //{
        //    Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
        //    try
        //    {
        //        response.Data = _service.GetSensors(deviceId);
        //    }
        //    catch (Exception ex)
        //    {
        //        return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
        //    }
        //    return response;
        //}
        [HttpGet]
        [Route(LookupRoute.Route.GetTagLookup, Name = LookupRoute.Name.GetTagLookup)]
        public Entity.BaseResponse<List<Entity.LookupItemWithDescription>> GetTemplateAttribute()
        {
            Entity.BaseResponse<List<Entity.LookupItemWithDescription>> response = new Entity.BaseResponse<List<Entity.LookupItemWithDescription>>(true);
            try
            {
                List<Entity.LookupItem> templates = _service.GetTemplate(false);
                if (templates.Count > 0)
                {
                    Guid templateId = new Guid(templates[0].Value);
                    response.Data = _service.GetTemplateAttribute(templateId);
                }
                else {
                    return new Entity.BaseResponse<List<Entity.LookupItemWithDescription>>(false, "Device template not found");
                }
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItemWithDescription>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(LookupRoute.Route.GetTemplateCommands, Name = LookupRoute.Name.GetTemplateCommands)]
        [EnsureGuidParameterAttribute("templateId", "Kit Type")]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetTemplateCommands(string templateId)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {
                response.Data = _service.GetTemplateCommands(Guid.Parse(templateId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }
        [HttpGet]
        [Route(LookupRoute.Route.GetEntityLookup, Name = LookupRoute.Name.GetEntityLookup)]
        [EnsureGuidParameterAttribute("companyId", "Company")]
        public Entity.BaseResponse<List<Entity.LookupItemWithStatus>> GetEntityLookup(string companyId)
        {
            Entity.BaseResponse<List<Entity.LookupItemWithStatus>> response = new Entity.BaseResponse<List<Entity.LookupItemWithStatus>>(true);
            try
            {
                response.Data = _service.FacilityLookup(Guid.Parse(companyId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItemWithStatus>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(LookupRoute.Route.GetSubEntityLookup, Name = LookupRoute.Name.GetSubEntityLookup)]
        [EnsureGuidParameterAttribute("entityId", "Location")]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetZoneLookup(string entityId, string type)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {

                response.Data = _service.ZoneLookup(Guid.Parse(entityId), type);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(LookupRoute.Route.GetProductLookup, Name = LookupRoute.Name.GetProductLookup)]
        [EnsureGuidParameterAttribute("productTypeId", "Lookup")]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetProductLookup(string productTypeId)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {

                response.Data = _service.ProductLookup(Guid.Parse(productTypeId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }
        [HttpGet]
        [Route(LookupRoute.Route.GetProductTypeLookup, Name = LookupRoute.Name.GetProductTypeLookup)]
        [EnsureGuidParameterAttribute("deviceId", "Lookup")]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetProductTypeLookup(string deviceId)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {

                response.Data = _service.ProductTypeLookup(Guid.Parse(deviceId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }
        [HttpGet]
        [Route(LookupRoute.Route.GetDeviceProductLookup, Name = LookupRoute.Name.GetDeviceProductLookup)]
        [EnsureGuidParameterAttribute("deviceId", "Lookup")]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetDeviceProductLookup(string deviceId)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {

                response.Data = _service.DeviceProductLookup(Guid.Parse(deviceId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }
        [HttpGet]
        [Route(LookupRoute.Route.GetShelfLookup, Name = LookupRoute.Name.GetShelfLookup)]
        [EnsureGuidParameterAttribute("deviceId", "Device")]
        [EnsureGuidParameter("productTypeId","Product Type")]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetShelfLookup(string deviceId,string productTypeId)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {

                response.Data = _service.ShelfLookup(Guid.Parse(deviceId),Guid.Parse(productTypeId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(LookupRoute.Route.GetShelfCapacity, Name = LookupRoute.Name.GetShelfCapacity)]
        [EnsureGuidParameterAttribute("shelfId", "Shelf")]
        public Entity.BaseResponse<long> GetShelfCapacity(string shelfId)
        {
            Entity.BaseResponse<long> response = new Entity.BaseResponse<long>(true);
            try
            {
                var res = _service.GetShelfCapacity(Guid.Parse(shelfId));
                response.IsSuccess = true;
                response.Data = res;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<long>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(LookupRoute.Route.GetDeviceLookup, Name = LookupRoute.Name.GetDeviceLookup)]
        [EnsureGuidParameterAttribute("subentityId", "Zone")]
        public Entity.BaseResponse<List<Entity.LookupItemWithStatus>> GetDeviceLookup(string subentityId)
        {
            Entity.BaseResponse<List<Entity.LookupItemWithStatus>> response = new Entity.BaseResponse<List<Entity.LookupItemWithStatus>>(true);
            try
            {
                response.Data = _service.DeviceLookup(Guid.Parse(subentityId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItemWithStatus>>(false, ex.Message);
            }
            return response;
        }
        [HttpGet]
        [Route(LookupRoute.Route.GetDeviceLatestAttributeLookup, Name = LookupRoute.Name.GetDeviceLatestAttributeLookup)]
        [EnsureGuidParameterAttribute("deviceId", "Device")]
        public Entity.BaseResponse<List<Entity.AttributeItem>> GetDeviceAttributeLookup(string deviceId)
        {
            Entity.BaseResponse<List<Entity.AttributeItem>> response = new Entity.BaseResponse<List<Entity.AttributeItem>>(true);
            try
            {
                response = _service.DeviceAttributeLookup(Guid.Parse(deviceId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.AttributeItem>>(false, ex.Message);
            }
            return response;
        }
    }
}