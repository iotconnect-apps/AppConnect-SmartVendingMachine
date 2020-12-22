using component.helper;
using component.logger;
using iot.solution.model.Models;
using iot.solution.model.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using Model = iot.solution.model.Models;
using LogHandler = component.services.loghandler;
namespace iot.solution.model.Repository.Implementation
{
    public class ProductTypeRepository : GenericRepository<Models.ProductType>, IProductTypeRepository
    {
        private readonly LogHandler.Logger logger;
        public ProductTypeRepository(IUnitOfWork unitOfWork, LogHandler.Logger logManager) : base(unitOfWork, logManager)
        {
            logger = logManager;
            _uow = unitOfWork;
        }

        public List<Model.ProductType> GetAllProductTypes()
        {
            return _uow.DbContext.ProductType.Where(t=>!t.IsDeleted).ToList();
        }
    }
}