using component.logger;
using iot.solution.data;
using iot.solution.model.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;
using LogHandler = component.services.loghandler;

namespace iot.solution.model.Repository.Implementation
{
    public class InventoryRepository: GenericRepository<Model.Inventory>, IInventoryRepository
    {
        private readonly LogHandler.Logger logger;
        public InventoryRepository(IUnitOfWork unitOfWork, LogHandler.Logger logManager) : base(unitOfWork, logManager)
        {
            logger = logManager;
            _uow = unitOfWork;
        }
        public Entity.InventoryDetail Get(Guid id)
        {
            Entity.SearchResult<List<Entity.InventoryDetail>> listResult = new Entity.SearchResult<List<Entity.InventoryDetail>>();
            var result = new Entity.InventoryDetail();
            try
            {
                logger.InfoLog(Constants.ACTION_ENTRY, "DeviceRepository.Get");

                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<System.Data.Common.DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CompanyId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("companyGuid", component.helper.SolutionConfiguration.CompanyId, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("guid", id, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    System.Data.Common.DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Inventory_Get]", CommandType.StoredProcedure, null), parameters.ToArray());
                    listResult.Items = DataUtils.DataReaderToList<Entity.InventoryDetail>(dbDataReader, null);
                    if (listResult.Items.Count > 0)
                    {
                        result = listResult.Items[0];
                    }
                }
                logger.InfoLog(Constants.ACTION_EXIT, "DeviceRepository.Get");
            }
            catch (Exception ex)
            {
                logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        public Entity.ActionStatus Manage(Model.Inventory request,bool isClearShelf)
        {
            Entity.ActionStatus result = new Entity.ActionStatus(true);
            try
            {
                logger.InfoLog(Constants.ACTION_ENTRY, "InventoryRepository.Add");
                int outPut = 0;
                int intResult = 0;
                string guidResult = string.Empty;
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("companyGuid", request.CompanyGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("entityGuid", request.EntityGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("deviceGuid", request.DeviceGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("deviceItemGuid", request.DeviceItemGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("productGuid", request.ProductGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("refillDate", request.RefillDateTime, DbType.DateTime, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("qty", request.Quantity, DbType.Int32, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("isClearShelf", isClearShelf, DbType.Boolean, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("newid", request.Guid, DbType.Guid, ParameterDirection.Output));
                    intResult = sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[Inventory_Add]", CommandType.StoredProcedure, null), parameters.ToArray());
                    guidResult = parameters.Where(p => p.ParameterName.Equals("newid")).FirstOrDefault().Value.ToString();
                    outPut = int.Parse(parameters.Where(p => p.ParameterName.Equals("output")).FirstOrDefault().Value.ToString());
                    if (outPut >= 0)
                    {
                        if (!string.IsNullOrEmpty(guidResult))
                        {
                            result.Data = Guid.Parse(guidResult);
                        }
                    }
                    else
                    {
                        result.Success = false;
                        string msg = parameters.Where(p => p.ParameterName.Equals("fieldname")).FirstOrDefault().Value.ToString();
                        if(msg== "InventoryAlreadyExists")
                        {
                            result.Message = "Inventory Already Exists";
                        }
                        else if(msg == "RefillQuantityMustBeLessThanCapacity")
                        {
                            result.Message = "Refill Quantity Must Be Less Than Capacity";
                        }
                        else
                        {
                            result.Message = "Failed To Save Inventory";
                        }
                    }

                }
                logger.InfoLog(Constants.ACTION_EXIT, "InventoryRepository.Add");
            }
            catch (Exception ex)
            {
                logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }

        public Entity.ActionStatus UpdateInventory(Entity.Inventory request)
        {
            Entity.ActionStatus result = new Entity.ActionStatus(true);
            try
            {
                logger.InfoLog(Constants.ACTION_ENTRY, "InventoryRepository.Update");
                int outPut = 0;
                int intResult = 0;
                string guidResult = string.Empty;
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.Guid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("deviceItemGuid", request.DeviceItemGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("action", request.Action, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("qty", request.Quantity, DbType.Int32, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    intResult = sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[Inventory_Update]", CommandType.StoredProcedure, null), parameters.ToArray());
                    outPut = int.Parse(parameters.Where(p => p.ParameterName.Equals("output")).FirstOrDefault().Value.ToString());
                    if (outPut > 0)
                    {
                        result.Success = true;
                        result.Message = "Inventory Updated Successfully !!";
                    }
                    else
                    {
                        result.Success = false;
                        string msg = parameters.Where(p => p.ParameterName.Equals("fieldname")).FirstOrDefault().Value.ToString();
                        if (msg == "InventoryNotFound")
                        {
                            result.Message = "Inventory Not Found";
                        }
                        else if (msg == "RefillQuantityMustBeLessThanCapacity")
                        {
                            result.Message = "Refill Quantity Must Be Less Than Capacity";
                        }
                        else
                        {
                            result.Message = msg;
                        }
                    }
                }
                logger.InfoLog(Constants.ACTION_EXIT, "InventoryRepository.Update");
            }
            catch (Exception ex)
            {
                logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }

        
        public Entity.ActionStatus ClearShelf(Model.Inventory request)
        {
            Entity.ActionStatus result = new Entity.ActionStatus(true);
            try
            {
                logger.InfoLog(Constants.ACTION_ENTRY, "InventoryRepository.Update");
                int outPut = 0;
                int intResult = 0;
                string guidResult = string.Empty;
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("companyGuid", component.helper.SolutionConfiguration.CompanyId, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("deviceItemGuid", request.DeviceItemGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("inventoryGuid", request.Guid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    intResult = sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[Inventory_ClearShelf]", CommandType.StoredProcedure, null), parameters.ToArray());
                    outPut = int.Parse(parameters.Where(p => p.ParameterName.Equals("output")).FirstOrDefault().Value.ToString());
                    if (outPut > 0)
                    {
                        result.Success = true;
                        result.Message = "Inventory Shelf Cleared Successfully !!";
                    }
                    else
                    {
                        result.Success = false;
                        result.Message = parameters.Where(p => p.ParameterName.Equals("fieldname")).FirstOrDefault().Value.ToString();
                    }
                }
                logger.InfoLog(Constants.ACTION_EXIT, "InventoryRepository.ShelfClear");
            }
            catch (Exception ex)
            {
                logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        public Entity.SearchResult<List<Model.InventoryDetail>> List(Entity.SearchRequest request)
        {
            Entity.SearchResult<List<Model.InventoryDetail>> result = new Entity.SearchResult<List<Model.InventoryDetail>>();
            try
            {
                logger.InfoLog(Constants.ACTION_ENTRY, "ProductRepository.List");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, request.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("companyGuid", component.helper.SolutionConfiguration.CompanyId, DbType.Guid, ParameterDirection.Input));
                    if (!request.EntityId.Equals(Guid.Empty))
                    {
                        parameters.Add(sqlDataAccess.CreateParameter("entityGuid", request.EntityId, DbType.Guid, ParameterDirection.Input));
                    }
                    if (!string.IsNullOrEmpty(request.Guid))
                    {
                        parameters.Add(sqlDataAccess.CreateParameter("deviceGuid", new Guid(request.Guid), DbType.Guid, ParameterDirection.Input));
                    }
                    if (!request.ProductTypeGuid.Equals(Guid.Empty))
                    {
                        parameters.Add(sqlDataAccess.CreateParameter("productTypeGuid", request.ProductTypeGuid, DbType.Guid, ParameterDirection.Input));
                    }
                    if (!request.ProductId.Equals(Guid.Empty))
                    {
                        parameters.Add(sqlDataAccess.CreateParameter("productGuid", request.ProductId, DbType.Guid, ParameterDirection.Input));
                    }
                    parameters.Add(sqlDataAccess.CreateParameter("search", request.SearchText, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("pagesize", request.PageSize, DbType.Int32, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("pagenumber", request.PageNumber, DbType.Int32, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("orderby", request.OrderBy, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("count", DbType.Int32, ParameterDirection.Output, 16));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Inventory_List]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Items = DataUtils.DataReaderToList<Model.InventoryDetail>(dbDataReader, null);
                    result.Count = int.Parse(parameters.Where(p => p.ParameterName.Equals("count")).FirstOrDefault().Value.ToString());
                }
                logger.InfoLog(Constants.ACTION_EXIT, "ProductRepository.List");
            }
            catch (Exception ex)
            {
                logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }

        public List<Entity.InventoryHistoryDetail> HistoryDetail(Guid deviceItemGuid)
        {
            List<Entity.InventoryHistoryDetail> result = new List<Entity.InventoryHistoryDetail>();
            try
            {
                logger.InfoLog(Constants.ACTION_ENTRY, "ProductRepository.InventoryHistory");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("deviceItemGuid", deviceItemGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[DeviceItemHistory_List]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result = DataUtils.DataReaderToList<Entity.InventoryHistoryDetail>(dbDataReader, null);
                }
                logger.InfoLog(Constants.ACTION_EXIT, "ProductRepository.InventoryHistory");
            }
            catch (Exception ex)
            {
                logger.ErrorLog(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
    }
}
