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
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
      
        private readonly ILogger _logger;
       

        public ProductService(IProductRepository productRepository, ILogger logger, IDeviceRepository deviceRepository, IDeviceService deviceService)
        {
            _logger = logger;
            _productRepository = productRepository;
              }
        
        public Entity.Product Get(Guid id)
        {
            try
            {
                Entity.Product response = _productRepository.FindBy(r => r.Guid == id).Select(p => Mapper.Configuration.Mapper.Map<Entity.Product>(p)).FirstOrDefault();
               
                return response;
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "ProductService.Get " + ex);
                return null;
            }
        }
        public Entity.ActionStatus Manage(Entity.ProductModel request)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                if (request.Guid == null || request.Guid == Guid.Empty)
                {
                    var checkExisting = _productRepository.FindBy(x => x.Name.Equals(request.Name) && x.CompanyGuid.Equals(SolutionConfiguration.CompanyId) && x.IsActive == true && !x.IsDeleted).FirstOrDefault();
                    if (checkExisting == null)
                    {
                      //  request.Guid = Guid.NewGuid();
                        var dbProduct = Mapper.Configuration.Mapper.Map<Entity.ProductModel, Model.Product>(request);
                        if (request.ImageFile != null)
                        {
                            // upload image                                     
                            dbProduct.Image = SaveProductImage(request.Guid, request.ImageFile);
                        }
                      //  dbProduct.Guid =  request.Guid;
                        dbProduct.CompanyGuid = SolutionConfiguration.CompanyId;
                        dbProduct.CreatedDate = DateTime.Now;
                        dbProduct.CreatedBy = SolutionConfiguration.CurrentUserId;
                        actionStatus = _productRepository.Manage(dbProduct);
                        actionStatus.Data = Mapper.Configuration.Mapper.Map<Model.Product, Entity.Product>(dbProduct);
                        if (!actionStatus.Success)
                        {
                            _logger.Error($"Product is not added in solution database, Error: {actionStatus.Message}");
                            actionStatus.Success = false;
                            actionStatus.Message = "Product is not added Something Went Wrong";
                        }

                    }
                    else
                    {
                        _logger.Error($"Product name Already Exist !!");
                        actionStatus.Success = false;
                        actionStatus.Message = "Product Name Already Exists";
                    }
                }
                else
                {
                    var olddbEntity = _productRepository.FindBy(x => x.Guid.Equals(request.Guid)).FirstOrDefault();
                    if (olddbEntity == null)
                    {
                        throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : Location");
                    }
                    string existingImage = olddbEntity.Image;
                    var dbProduct = Mapper.Configuration.Mapper.Map(request, olddbEntity);
                    if (request.ImageFile != null)
                    {
                        if (File.Exists(SolutionConfiguration.UploadBasePath + dbProduct.Image) && request.ImageFile.Length > 0)
                        {
                            //if already exists image then delete  old image from server
                            File.Delete(SolutionConfiguration.UploadBasePath + dbProduct.Image);
                        }
                        if (request.ImageFile.Length > 0)
                        {
                            // upload new image                                     
                            dbProduct.Image = SaveProductImage(request.Guid, request.ImageFile);
                        }
                    }
                    else
                    {
                        dbProduct.Image = existingImage;
                    }
                    dbProduct.UpdatedDate = DateTime.Now;
                    dbProduct.UpdatedBy = SolutionConfiguration.CurrentUserId;
                    dbProduct.CompanyGuid = SolutionConfiguration.CompanyId;

                    actionStatus = _productRepository.Manage(dbProduct);
                    actionStatus.Data = Mapper.Configuration.Mapper.Map<Model.Product, Entity.Product>(dbProduct);
                    if (!actionStatus.Success)
                    {
                        _logger.Error($"Location is not updated in solution database, Error: {actionStatus.Message}");
                        actionStatus.Success = false;
                        actionStatus.Message = "Something Went Wrong!";
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "ProductService.Manage " + ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        // Saving Image on Server   
        private string SaveProductImage(Guid guid, IFormFile image)
        {
            var fileBasePath = SolutionConfiguration.UploadBasePath + SolutionConfiguration.ProductFilePath;
            bool exists = System.IO.Directory.Exists(fileBasePath);
            if (!exists)
                System.IO.Directory.CreateDirectory(fileBasePath);
            string extension = Path.GetExtension(image.FileName);
            Int32 unixTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            string fileName = guid.ToString() + "_" + unixTimestamp;

            var filePath = Path.Combine(fileBasePath, fileName + extension);
            if (image != null && image.Length > 0)
            {
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    image.CopyTo(fileStream);
                }
                return Path.Combine(SolutionConfiguration.ProductFilePath, fileName + extension);
            }
            return null;
        }
        public Entity.ActionStatus Delete(Guid id)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                var dbProduct = _productRepository.FindBy(x => x.Guid.Equals(id)).FirstOrDefault();
                if (dbProduct == null)
                {
                    throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : Location");
                }
                        dbProduct.IsDeleted = true;
                        dbProduct.UpdatedDate = DateTime.Now;
                        dbProduct.UpdatedBy = SolutionConfiguration.CurrentUserId;
                        return _productRepository.Update(dbProduct);
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "Location.Delete " + ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        // Delete Image on Server   
        private bool DeleteProductImage(Guid guid, string imageName)
        {
            var fileBasePath = SolutionConfiguration.UploadBasePath + SolutionConfiguration.ProductFilePath;
            var filePath = Path.Combine(fileBasePath, imageName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
            return true;
        }
        public Entity.ActionStatus DeleteImage(Guid id)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(false);
            try
            {
                var dbProduct = _productRepository.FindBy(x => x.Guid.Equals(id)).FirstOrDefault();
                if (dbProduct == null)
                {
                    throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : Entity");
                }

                bool deleteStatus = DeleteProductImage(id, dbProduct.Image);
                if (deleteStatus)
                {
                    dbProduct.Image = "";
                    dbProduct.UpdatedDate = DateTime.Now;
                    dbProduct.UpdatedBy = SolutionConfiguration.CurrentUserId;
                    dbProduct.CompanyGuid = SolutionConfiguration.CompanyId;

                    actionStatus = _productRepository.Manage(dbProduct);
                    actionStatus.Data = Mapper.Configuration.Mapper.Map<Model.Product, Entity.Product>(dbProduct);
                    actionStatus.Success = true;
                    actionStatus.Message = "Image deleted successfully!";
                    if (!actionStatus.Success)
                    {
                        _logger.Error($"Entity is not updated in database, Error: {actionStatus.Message}");
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                }
                else
                {
                    actionStatus.Success = false;
                    actionStatus.Message = "Image not deleted!";
                }
                return actionStatus;
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "ProductManager.DeleteImage " + ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.SearchResult<List<Entity.ProductDetail>> List(Entity.SearchRequest request)
        {
            try
            {
                var result = _productRepository.List(request);
                Entity.SearchResult<List<Entity.ProductDetail>> response = new Entity.SearchResult<List<Entity.ProductDetail>>()
                {
                    Items = result.Items.Select(p => Mapper.Configuration.Mapper.Map<Entity.ProductDetail>(p)).ToList(),
                    Count = result.Count
                };
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, $"ProductService.List, Error: {ex.Message}");
                return new Entity.SearchResult<List<Entity.ProductDetail>>();
            }
        }
      
        public Entity.BaseResponse<Entity.DashboardOverviewResponse> GetProductDetail(Guid productId,DateTime? CurrentDate ,string TimeZone)
        {
            Entity.BaseResponse<List<Entity.DashboardOverviewResponse>> listResult = new Entity.BaseResponse<List<Entity.DashboardOverviewResponse>>();
            Entity.BaseResponse<Entity.DashboardOverviewResponse> result = new Entity.BaseResponse<Entity.DashboardOverviewResponse>(true);
            try
            {
                listResult = _productRepository.GetStatistics(productId,CurrentDate,  TimeZone);               
                if (listResult.Data.Count > 0)
                {
                    result.IsSuccess = true;
                    result.Data = listResult.Data[0];
                    result.LastSyncDate = listResult.LastSyncDate;                   
                }
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }

    }
}
