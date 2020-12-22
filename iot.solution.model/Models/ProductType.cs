using System;
using System.Collections.Generic;

namespace iot.solution.model.Models
{
    public partial class ProductType
    {
        public Guid Guid { get; set; }
        public string TypeName { get; set; }
        public bool? IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}
