using System;
using System.Collections.Generic;

namespace iot.solution.model.Models
{
    public partial class DeviceItemHistory
    {
        public Guid Guid { get; set; }
        public Guid DeviceItemGuid { get; set; }
        public string Operation { get; set; }
        public long RefillQuantity { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
    }
}
