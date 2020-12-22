using iot.solution.entity.Response;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity
{
    
    public class Product
    {
        public Guid Guid { get; set; }
        public Guid CompanyGuid { get; set; }
        public Guid ProductTypeGuid { get; set; }
        public string Name { get; set; }
        public string Image { get; set; }
        public bool? IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
    public class ProductModel : Product
    {
        public IFormFile ImageFile { get; set; }

    }
    public class ProductDetail : Product 
    { 
    public string ProductType { get; set; }
      
    }
}
