using iot.solution.entity;
using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;
using Response = iot.solution.entity.Response;

namespace iot.solution.model.Repository.Interface
{
    public interface IDeviceRepository : IGenericRepository<Model.Device>
    {
        Model.DeviceDetailModel Get(Guid device);
        Entity.ActionStatus Manage(Model.DeviceModel request);
        Entity.ActionStatus Delete(Guid id);
        Entity.SearchResult<List<Model.DeviceDetail>> List(Entity.SearchRequest request);
        List<Response.EntityWiseDeviceResponse> GetEntityWiseDevices(Guid? locationId, Guid? deviceId);
        Entity.BaseResponse<int> ValidateKit(string kitCode);
        Entity.BaseResponse<List<Entity.HardwareKit>> ProvisionKit(Entity.ProvisionKitRequest request);
       
       
        List<LookupItem> GetDeviceLookup();
    }
}
