using component.helper;
using component.logger;
using iot.solution.common;
using iot.solution.model.Repository.Interface;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Entity = iot.solution.entity;
using IOT = IoTConnect.Model;
using Model = iot.solution.model.Models;
using Response = iot.solution.entity.Response;

namespace iot.solution.service.Implementation
{
    public class InventoryService: IInventoryService
    {
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IProductRepository _productRepository;
        private readonly ILogger _logger;

        public InventoryService(IInventoryRepository inventoryRepository,IProductRepository productRepository, ILogger logger)
        {
            _logger = logger;
            _inventoryRepository = inventoryRepository;
            _productRepository = productRepository;
        }
        public Entity.InventoryDetail Get(Guid id)
        {
            try
            {
                return _inventoryRepository.Get(id);
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "ProductService.Get " + ex);
                return null;
            }
        }
        public Entity.ActionStatus Manage(Entity.Inventory request)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                if (request.Guid == null || request.Guid == Guid.Empty)
                {
                    var dbInventory = Mapper.Configuration.Mapper.Map<Entity.Inventory, Model.Inventory>(request);
                    dbInventory.Guid = request.Guid;
                    dbInventory.CompanyGuid = SolutionConfiguration.CompanyId;
                    DateTime dateValue;
                    if (DateTime.TryParse(request.RefillDateTime.ToString(), out dateValue))
                    dbInventory.RefillDateTime = dateValue;
                    actionStatus = _inventoryRepository.Manage(dbInventory, request.IsClearShelf);
                    if (actionStatus.Data != null)
                    {
                        actionStatus.Data = actionStatus.Data;
                        actionStatus.Success = true;
                        actionStatus.Message = actionStatus.Message;
                    }
                    if (!actionStatus.Success)
                    {
                        _logger.Error($"Inventory is not added, Error: {actionStatus.Message}");
                        actionStatus.Data = Guid.Empty;
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                }
                else
                {
                    var olddbInventory = _inventoryRepository.FindBy(x => x.Guid.Equals(request.Guid)).FirstOrDefault();
                    if (olddbInventory == null)
                    {
                        throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : Inventory");
                    }
                    actionStatus = _inventoryRepository.UpdateInventory(request);
                    if (actionStatus.Success)
                    {
                        actionStatus.Success = true;
                        actionStatus.Message = actionStatus.Message;
                        actionStatus.Data = request.Guid;
                    }
                    else
                    {
                        _logger.Error($"Inventory not Updated, Error: {actionStatus.Message}");
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                        actionStatus.Data = request.Guid;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "Inventory.Add " + ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }


        public Entity.ActionStatus ClearShelf(Guid inventoryId)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                    var olddbInventory = _inventoryRepository.FindBy(x => x.Guid.Equals(inventoryId)).FirstOrDefault();
                    if (olddbInventory == null)
                    {
                        throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : Inventory");
                    }
                    actionStatus = _inventoryRepository.ClearShelf(olddbInventory);
                    if (actionStatus.Success)
                    {
                        actionStatus.Success = true;
                        actionStatus.Message = actionStatus.Message;
                    }
                    else
                    {
                        _logger.Error($"Inventory not Updated, Error: {actionStatus.Message}");
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "Inventory.Add " + ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.SearchResult<List<Entity.InventoryDetail>> List(Entity.SearchRequest request)
        {
            try
            {
               // var result = _inventoryRepository.List(request);
                Entity.SearchResult<List<Model.InventoryDetail>> result = _inventoryRepository.List(request);
                Entity.SearchResult<List<Entity.InventoryDetail>> response = new Entity.SearchResult<List<Entity.InventoryDetail>>()
                {
                    Items = result.Items.Select(p => Mapper.Configuration.Mapper.Map<Entity.InventoryDetail>(p)).ToList(),
                    Count = result.Count
                };

                return response;
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, $"Inventory.List, Error: {ex.Message}");
                return new Entity.SearchResult<List<Entity.InventoryDetail>>();
            }
        }
        public Entity.InventoryHistoryDetail HistoryDetail(Guid deviceItemGuid)
        {
            try
            {
                Entity.InventoryHistoryDetail response = new Entity.InventoryHistoryDetail();
                List<Entity.InventoryHistoryDetail> result = _inventoryRepository.HistoryDetail(deviceItemGuid);
                
                if (result.Count > 0)
                {
                    List<Entity.RefillDetail> refill = new List<Entity.RefillDetail>();
                    response = result[0];
                    foreach (var items in result)
                    {
                        refill.Add(new Entity.RefillDetail { ProductName = items.ProductName, ProductType = items.ProductType, RefillQuantity = items.RefillQuantity, RefillDate = items.RefillDate,Operation = items.Operation });
                    }
                    response.refillDetails = refill;
                }
                return response;
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, $"Inventory.List, Error: {ex.Message}");
                return new Entity.InventoryHistoryDetail();
            }
        }
        //public Entity.Inventory Get(Guid id)
        //{
        //    Entity.Inventory maintenance = new Entity.Inventory();
        //    try
        //    {
        //        //maintenance = _deviceMaintenanceRepository
        //        //    .FindBy(t => t.Guid == id).Select(p => Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenance>(p)).FirstOrDefault();
        //        maintenance = _inventoryRepository.Get(id);
        //        return maintenance;

        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.Error(Constants.ACTION_EXCEPTION, "DeviceMaintenance.Get " + ex);
        //        return null;
        //    }
        //}
    }
}
