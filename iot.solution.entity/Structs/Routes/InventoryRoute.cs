using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Structs.Routes
{
    public class InventoryRoute
    {
        public struct Name
        {
            public const string Manage = "Inventory.manage";
            public const string GetList = "Inventory.list";
            public const string GetById = "Inventory.getbyid";
            public const string Delete = "Inventory.delete";
            public const string BySearch = "Inventory.search";
            public const string UpdateStatus = "device.updatestatus";
            public const string GetHistory = "Inventory.history";
            public const string ClearShelf = "Inventory.clearshelf";
        }

        public struct Route
        {
            public const string Global = "api/inventory";
            public const string Manage = "manage";
            public const string GetList = "";
            public const string GetById = "{id}";
            public const string Delete = "delete/{id}";
            public const string BySearch = "search";
            public const string GetHistory = "gethistory/{deviceItemGuid}";
            public const string ClearShelf = "clearshelf/{inventoryId}";
        }
    }
}
