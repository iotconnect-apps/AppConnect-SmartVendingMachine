using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entity = iot.solution.entity;

namespace iot.solution.service.Interface
{
    public interface ILookupService
    {
        List<Entity.LookupItem> Get(string type, string param);
        List<Entity.LookupItem> GetTemplate(bool isGateway);
        List<Entity.LookupItem> GetAllTemplate();
        List<Entity.TagLookup> GetTagLookup(Guid templateId);
        List<Entity.LookupItem> GetSensors(Guid deviceId);
        List<Entity.LookupItemWithDescription> GetTemplateAttribute(Guid templateId);
        List<Entity.LookupItem> GetTemplateCommands(Guid templateId);
        string GetIotTemplateGuidByCode();
        List<Entity.LookupItem> GetAllTemplateFromIoT();
        List<Entity.KitTypeAttribute> GetAllAttributesFromIoT(string templateGuid);
        List<Entity.LookupItem> GetAllCommandsFromIoT(string templateGuid);

        List<Entity.LookupItemWithStatus> FacilityLookup(Guid companyId);

        List<Entity.LookupItem> ZoneLookup(Guid facilityId,string type);
        List<Entity.LookupItem> ProductLookup(Guid productTypeId);
        List<Entity.LookupItem> ProductTypeLookup(Guid deviceId);
        List<Entity.LookupItem> DeviceProductLookup(Guid deviceId);
        List<Entity.LookupItem> ShelfLookup(Guid deviceId,Guid productTypeId);
        long GetShelfCapacity(Guid shelfId);
        List<Entity.LookupItemWithStatus> DeviceLookup(Guid zoneId);
        Entity.BaseResponse<List<Entity.AttributeItem>> DeviceAttributeLookup(Guid deviceId);
    }
}