using component.helper;
using component.logger;
using iot.solution.model.Models;
using iot.solution.model.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using Model = iot.solution.model.Models;
using LogHandler = component.services.loghandler;
namespace iot.solution.model.Repository.Implementation
{
    public class DeviceItemRepository : GenericRepository<Models.DeviceItem>, IDeviceItemRepository
    {
        private readonly LogHandler.Logger logger;
        public DeviceItemRepository(IUnitOfWork unitOfWork, LogHandler.Logger logManager) : base(unitOfWork, logManager)
        {
            logger = logManager;
            _uow = unitOfWork;
        }

        public List<Model.DeviceItem> GetAllDeviceItems()
        {
            return _uow.DbContext.DeviceItem.Where(t=>!t.IsDeleted).ToList();
        }
        public List<Model.DeviceItem> GetDeviceItems(Guid deviceGuid)
        {
            return _uow.DbContext.DeviceItem.Where(t => t.DeviceGuid.Equals(deviceGuid) && !t.IsDeleted).OrderBy(t=>t.Sequence).ToList();
        }
    }
}