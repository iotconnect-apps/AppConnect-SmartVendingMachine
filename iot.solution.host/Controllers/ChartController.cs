using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;
using Response = iot.solution.entity.Response;
using Request = iot.solution.entity.Request;
using System.Linq;

namespace host.iot.solution.Controllers
{
    [Route(ChartRoute.Route.Global)]
    [ApiController]
    public class ChartController : BaseController
    {
        private readonly IChartService _chartService;
        
        public ChartController(IChartService chartService)
        {
            _chartService = chartService;
        }
       

        [HttpPost]
        [Route(ChartRoute.Route.EnergyUsage, Name = ChartRoute.Name.EnergyUsage)]
        public Entity.BaseResponse<List<Response.EnergyUsageResponse>> EnergyUsage(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.EnergyUsageResponse>> response = new Entity.BaseResponse<List<Response.EnergyUsageResponse>>(true);
            try
            {
                response.Data = _chartService.GetEnergyUsage(request);
            }
            catch (Exception ex) {
                base.LogException(ex);
            }
            return response;
        }
        [HttpPost]
        [Route(ChartRoute.Route.GetStatisticsByDevice, Name = ChartRoute.Name.GetStatisticsByDevice)]
        public Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> StatisticsByDevice(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> response = new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>(true);
            try
            {
                response = _chartService.GetStatisticsByDevice(request);
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.DeviceStatisticsResponse>>(false, ex.Message);
            }
            return response;
        }

        [HttpPost]
        [Route(ChartRoute.Route.InventoryConsumption, Name = ChartRoute.Name.InventoryConsumption)]
        public Entity.BaseResponse<List<Response.InventoryConsumptionResponse>> InventoryConsumption(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.InventoryConsumptionResponse>> response = new Entity.BaseResponse<List<Response.InventoryConsumptionResponse>>(true);
            try
            {
                response.Data = _chartService.GetInventoryConsumption(request);
            }
            catch (Exception ex) {
                base.LogException(ex);
            }
            return response;
        }
        [HttpPost]
        [Route(ChartRoute.Route.InventoryConsumptionPrediction, Name = ChartRoute.Name.InventoryConsumptionPrediction)]
        public Entity.BaseResponse<List<Response.InventoryConsumptionResponse>> InventoryConsumptionPrediction(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.InventoryConsumptionResponse>> response = new Entity.BaseResponse<List<Response.InventoryConsumptionResponse>>(true);
            try
            {
                response.Data = _chartService.GetInventoryConsumptionPrediction(request);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
            }
            return response;
        }
        [HttpPost]
        [Route(ChartRoute.Route.InventoryStatus, Name = ChartRoute.Name.InventoryStatus)]
        public Entity.BaseResponse<List<Response.InventoryStatusResponse>> InventoryStatus(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.InventoryStatusResponse>> response = new Entity.BaseResponse<List<Response.InventoryStatusResponse>>(true);
            try
            {
                response.Data = _chartService.GetInventoryStatus(request);
            }
            catch (Exception ex)
            {
                base.LogException(ex);
            }
            return response;
        }
        [HttpPost]
        [Route(ChartRoute.Route.InventoryConsumptionByProduct, Name = ChartRoute.Name.InventoryConsumptionByProduct)]
        public Entity.BaseResponse<List<Response.InventoryConsumptionByProductResponse>> InventoryConsumptionByProduct(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.InventoryConsumptionByProductResponse>> response = new Entity.BaseResponse<List<Response.InventoryConsumptionByProductResponse>>(true);
            try
            {
                response.Data = _chartService.GetInventoryConsumptionByProduct(request);
                response.Message = response.Data.Sum(t => long.Parse(t.TotalAvailableQty)).ToString() + "/"+ response.Data.Sum(t => long.Parse(t.TotalCapacity)).ToString();
            }
            catch(Exception ex)
            {
                base.LogException(ex);
            }
            return response;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route(ChartRoute.Route.ExecuteCrone, Name = ChartRoute.Name.ExecuteCrone)]
        public Entity.BaseResponse<bool> ExecuteCrone()
        {
            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                var res = _chartService.TelemetrySummary_HourWise();
                var dayRes = _chartService.TelemetrySummary_DayWise();
                response.IsSuccess = res.Success;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<bool>(false, ex.Message);
            }
            return response;
        }
    }
}