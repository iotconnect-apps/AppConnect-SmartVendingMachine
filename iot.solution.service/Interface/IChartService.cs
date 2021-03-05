using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Request = iot.solution.entity.Request;
using Response = iot.solution.entity.Response;

namespace iot.solution.service.Interface
{
    public interface IChartService
    {
        Entity.ActionStatus TelemetrySummary_DayWise();
        Entity.ActionStatus TelemetrySummary_HourWise();
        Entity.ActionStatus TelemetrySummary_ShelfConsumption();
        List<Response.InventoryConsumptionResponse> GetInventoryConsumption(Request.ChartRequest request);
        List<Response.InventoryConsumptionResponse> GetInventoryConsumptionPrediction(Request.ChartRequest request);
        
        List<Response.InventoryStatusResponse> GetInventoryStatus(Request.ChartRequest request);
        List<Response.InventoryConsumptionByProductResponse> GetInventoryConsumptionByProduct(Request.ChartRequest request);
        List<Response.EnergyUsageResponse> GetEnergyUsage(Request.ChartRequest request);
        Entity.BaseResponse<List<Response.DeviceStatisticsResponse>> GetStatisticsByDevice(Request.ChartRequest request);
        Entity.ActionStatus SendSubscriptionNotification();

    }
}
