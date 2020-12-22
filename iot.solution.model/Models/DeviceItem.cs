using System;
using System.Collections.Generic;

namespace iot.solution.model.Models
{
    public partial class DeviceItem
    {
        public Guid Guid { get; set; }
        public Guid DeviceGuid { get; set; }
        public Guid ProductTypeGuid { get; set; }
        public string Sequence { get; set; }
        public string UniqueId { get; set; }
        public long? Capacity { get; set; }
        public bool? IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}
