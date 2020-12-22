using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;

namespace iot.solution.model.Repository.Interface
{
    public interface IProductTypeRepository : IGenericRepository<Model.ProductType>
    {
        List<Model.ProductType> GetAllProductTypes();
      
    }
}
