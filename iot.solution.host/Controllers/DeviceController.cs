﻿using host.iot.solution.Filter;
using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;
namespace host.iot.solution.Controllers
{
    [Route(DeviceRoute.Route.Global)]
    public class DeviceController : BaseController
    {
        private readonly IDeviceService _service;

        public DeviceController(IDeviceService deviceService)
        {
            _service = deviceService;
        }

        [HttpGet]
        [Route(DeviceRoute.Route.GetList, Name = DeviceRoute.Name.GetList)]
        public Entity.BaseResponse<List<Entity.Device>> Get()
        {
            Entity.BaseResponse<List<Entity.Device>> response = new Entity.BaseResponse<List<Entity.Device>>(true);
            try
            {
                response.Data = _service.Get();
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.Device>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(DeviceRoute.Route.GetById, Name = DeviceRoute.Name.GetById)]
        [EnsureGuidParameterAttribute("id", "Device")]
        public Entity.BaseResponse<Model.DeviceDetailModel> Get(string id)
        {
            Entity.BaseResponse<Model.DeviceDetailModel> response = new Entity.BaseResponse<Model.DeviceDetailModel>(true);
            try
            {
                response.Data = _service.Get(Guid.Parse(id));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Model.DeviceDetailModel>(false, ex.Message);
            }
            return response;
        }

        [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
        [HttpPost]
        [Route(DeviceRoute.Route.Manage, Name = DeviceRoute.Name.Add)]
        public Entity.BaseResponse<Guid> Manage(Entity.DeviceModel request)
        {
            Entity.BaseResponse<Guid> response = new Entity.BaseResponse<Guid>(true);
            try
            {
                var status = _service.Manage(request);
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

       
        [ProducesResponseType(typeof(bool), (int)HttpStatusCode.OK)]
        [HttpPut]
        [Route(DeviceRoute.Route.Delete, Name = DeviceRoute.Name.Delete)]
        [EnsureGuidParameterAttribute("id", "Device")]
        public Entity.BaseResponse<bool> Delete(string id)
        {
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

       
        [HttpGet]
        [Route(DeviceRoute.Route.BySearch, Name = DeviceRoute.Name.BySearch)]
        public Entity.BaseResponse<Entity.SearchResult<List<Entity.Device>>> GetBySearch(string entityGuid="",string searchText = "", int? pageNo = 1, int? pageSize = 10, string orderBy = "")
        {
            Entity.BaseResponse<Entity.SearchResult<List<Entity.Device>>> response = new Entity.BaseResponse<Entity.SearchResult<List<Entity.Device>>>(true);
            try
            {
                response.Data = _service.List(new Entity.SearchRequest()
                {
                    EntityId = !string.IsNullOrEmpty(entityGuid)? Guid.Parse(entityGuid):Guid.Empty,
                    SearchText = searchText,
                    PageNumber = pageNo.Value,
                    PageSize = pageSize.Value,
                    OrderBy = orderBy
                });
                foreach (var data in response.Data.Items)
                {
                    var connectionStatus = _service.GetConnectionStatus(data.UniqueId);
                    if (connectionStatus.IsSuccess && connectionStatus.Data != null)
                        data.IsConnected = connectionStatus.Data.IsConnected;
                }
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.SearchResult<List<Entity.Device>>>(false, ex.Message);
            }
            return response;
        }

        [HttpPost]
        [Route(DeviceRoute.Route.UpdateStatus, Name = DeviceRoute.Name.UpdateStatus)]
        [EnsureGuidParameterAttribute("id", "Device")]
        public Entity.BaseResponse<bool> UpdateStatus(string id, bool status)
        {
            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                Entity.ActionStatus result = _service.UpdateStatus(Guid.Parse(id), status);
                response.IsSuccess = result.Success;
                response.Message = result.Message;
                response.Data = result.Success;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<bool>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(DeviceRoute.Route.ValidateKit, Name = DeviceRoute.Name.ValidateKit)]
        public Entity.BaseResponse<int> ValidateKit(string kitCode)
        {
            Entity.BaseResponse<int> response = new Entity.BaseResponse<int>(true);
            try
            {
                response = _service.ValidateKit(kitCode);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<int>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(DeviceRoute.Route.DeviceCounters, Name = DeviceRoute.Name.DeviceCounters)]
        public Entity.BaseResponse<Entity.DeviceCounterResult> DeviceCounters()
        {
            try
            {
                return _service.GetDeviceCounters();
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.DeviceCounterResult>(false, ex.Message);
            }
        }
       

        [HttpGet]
        [Route(DeviceRoute.Route.TelemetryData, Name = DeviceRoute.Name.TelemetryData)]
        [EnsureGuidParameterAttribute("deviceId", "Device")]
        public Entity.BaseResponse<List<Entity.DeviceTelemetryDataResult>> GetTelemetryData(string deviceId)
        {
            try
            {
                return _service.GetTelemetryData(Guid.Parse(deviceId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.DeviceTelemetryDataResult>>(false, ex.Message);
            }
        }

        [HttpGet]
        [Route(DeviceRoute.Route.ConnectionStatus, Name = DeviceRoute.Name.ConnectionStatus)]
        public Entity.BaseResponse<Entity.DeviceConnectionStatusResult> ConnectionStatus(string uniqueId)
        {
            try
            {
                return _service.GetConnectionStatus(uniqueId);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.DeviceConnectionStatusResult>(false, ex.Message);
            }
        }
    }
}