namespace iot.solution.entity
{
    
    public class DashboardOverviewResponse
    {
        public int TotalEntities { get; set; }
        public int TotalSubEntities { get; set; }
        public int TotalDevices { get; set; }
        public int TotalConnected { get; set; }
        public int TotalDisConnected { get; set; }
        public int TotalScheduledCount { get; set; }
        public int TotalUnderMaintenanceCount { get; set; }
        public string TotalEnergyCount { get; set; }
        public string MinDeviceName { get; set; }
        public string MinDeviceCount { get; set; }
        public string MaxDeviceName { get; set; }
        public string MaxDeviceCount { get; set; }

        public int ActiveUserCount { get; set; }
        public int InactiveUserCount { get; set; }
        public int TotalUserCount { get; set; }

        public int TotalAlerts { get; set; }
    }
}
