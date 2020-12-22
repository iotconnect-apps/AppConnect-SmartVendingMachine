using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Structs.Routes
{
    public struct ProductRoute
    {
        public struct Name
        {
            public const string Add = "product.add";
            public const string GetList = "product.list";
            public const string GetById = "product.getproductbyid";
            public const string Delete = "product.deleteproduct";
            public const string DeleteImage = "product.deleteproductimage";
            public const string BySearch = "product.search";            
        }

        public struct Route
        {
            public const string Global = "api/product";
            public const string Manage = "manage";
            public const string GetList = "";
            public const string GetById = "{id}";
            public const string Delete = "delete/{id}";
            public const string DeleteImage = "deleteimage/{id}";            
            public const string BySearch = "search";
           

        }
    }
}
