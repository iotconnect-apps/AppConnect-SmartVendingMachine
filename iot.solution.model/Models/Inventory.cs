using System;
using System.Collections.Generic;

namespace iot.solution.model.Models
{
    public partial class Inventory
    {
        public Guid Guid { get; set; }
        public Guid CompanyGuid { get; set; }
        public Guid EntityGuid { get; set; }
        public Guid? DeviceGuid { get; set; }
        public Guid? ProductGuid { get; set; }
        public DateTime? RefillDateTime { get; set; }
        public long? Quantity { get; set; }
        public Guid? DeviceItemGuid { get; set; }
        public bool? IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}
