using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.model.Models
{
    public class InventoryDetail : Inventory
    {
        public string CompanyName { get; set; }
        public string EntityName { get; set; }
        public string DeviceName { get; set; }
        public string ProductName { get; set; }
        public string ProductType { get; set; }
        public string ShelfId { get; set; }
        public long? AvailableQty { get; set; }
    }
}
