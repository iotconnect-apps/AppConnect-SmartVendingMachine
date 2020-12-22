namespace iot.solution.entity.Structs.Routes
{
    public struct LookupRoute
    {
        public struct Name
        {
            public const string Get = "lookup.get";
            public const string GetTemplate = "lookup.template";
            public const string GetAllTemplate = "lookup.alltemplate";
            public const string GetTagLookup = "lookup.attributes";
            public const string GetAllTemplateIoT = "lookup.alltemplateiot";
            public const string GetAttributesIoT = "lookup.allattributesiot";            
            public const string GetSensorsLookup = "lookup.sensors";
            public const string GetTemplateCommands = "lookup.GetTemplateCommands";
            public const string GetCommandsIoT = "allcommandsiot/{templateGuid}";
            public const string GetEntityLookup = "lookup.entitylookup";
            public const string GetProductTypeLookup = "lookup.productTypelookup";
            public const string GetShelfLookup = "lookup.shelflookup";
            public const string GetShelfCapacity = "lookup.shelfcapacity";
            public const string GetSubEntityLookup = "lookup.getzonelookup";
            public const string GetProductLookup = "lookup.productlookup";
            public const string GetDeviceLookup = "lookup.getdevicelookup";
            public const string GetDeviceProductLookup = "lookup.deviceproductlookup";
            public const string GetDeviceLatestAttributeLookup = "lookup.getdeviceattributelookup";
        }

        public struct Route
        {
            public const string Global = "api/lookup";
            public const string Get = "{type}/{param?}";
            public const string GetTemplate = "template/{isGateway?}";
            public const string GetAllTemplate = "alltemplate";
            public const string GetTagLookup = "attributes";
            public const string GetAllTemplateIoT = "alltemplateiot";
            public const string GetAttributesIoT = "allattributesiot/{templateGuid}";
            public const string GetCommandsIoT = "allcommandsiot/{templateGuid}";            
            public const string GetSensorsLookup = "sensors/{deviceId}";
            public const string GetTemplateCommands = "commands/{templateId}";
            public const string GetEntityLookup = "entitylookup/{companyId}";
            public const string GetProductTypeLookup = "productTypelookup/{deviceId}";
            public const string GetShelfLookup = "shelflookup/{deviceId}/{productTypeId}";
            public const string GetShelfCapacity = "shelfcapacity/{shelfId}";
            public const string GetSubEntityLookup = "zonelookup/{entityId}/{type?}";
            public const string GetProductLookup = "productlookup/{productTypeId}";
            public const string GetDeviceProductLookup = "deviceproductlookup/{deviceId}";
            public const string GetDeviceLookup = "devicelookup/{subentityId}";
            public const string GetDeviceLatestAttributeLookup = "deviceattributelookup/{deviceId}";
        }
    }
}
