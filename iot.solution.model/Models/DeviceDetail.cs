using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.model.Models
{
    public partial class DeviceDetail : Device
    {
        public string EntityName { get; set; }
        public string SubEntityName { get; set; }
    }
   
    public partial class DeviceModel : Device
    {
        public string ShelfData { get; set; }
       
    }
    public partial class DeviceDetailModel : Device
    {
        public string kitCode { get; set; }
        public List<DeviceItem> DeviceItems { get; set; }

    }
}
