using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Structs.Routes
{
    public class ChartRoute
    {
        public struct Name
        {
            public const string GetStatisticsByDevice = "chart.getstatisticsbydevice";
            public const string EnergyUsage = "chart.energyusage";
            public const string InventoryConsumption = "chart.getinventoryconsumption";
            public const string InventoryConsumptionPrediction = "chart.getinventoryconsumptionprediction";
            public const string InventoryConsumptionByProduct = "chart.getinventoryconsumptionbyproduct";
            public const string InventoryStatus = "chart.getinventorystatus";
            public const string ExecuteCrone = "chart.executecrone";
        }

        public struct Route
        {
            public const string Global = "api/chart";
            public const string GetStatisticsByDevice = "getstatisticsbydevice";
            public const string EnergyUsage = "getenergyusage";
            public const string InventoryConsumption = "getinventoryconsumption";
            public const string InventoryConsumptionPrediction = "getinventoryconsumptionprediction";
            public const string InventoryConsumptionByProduct = "getinventoryconsumptionbyproduct";
            public const string InventoryStatus = "getinventorystatus";
            public const string ExecuteCrone = "executecron";
        }
    }
}
