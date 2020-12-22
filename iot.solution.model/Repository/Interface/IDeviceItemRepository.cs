using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;

namespace iot.solution.model.Repository.Interface
{
    public interface IDeviceItemRepository : IGenericRepository<Model.DeviceItem>
    {
        List<Model.DeviceItem> GetAllDeviceItems();
        List<Model.DeviceItem> GetDeviceItems(Guid deviceGuid);
    }
}
