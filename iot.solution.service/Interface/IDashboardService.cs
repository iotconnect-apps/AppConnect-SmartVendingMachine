using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;

namespace iot.solution.service.Interface
{
    public interface IDashboardService
    {
        List<Entity.LookupItem> GetEntityLookup(Guid companyId);
        Entity.BaseResponse<Entity.DashboardOverviewResponse> GetOverview(DateTime currentDate, string timeZone);

        #region Dynamic Dashboard
        public Entity.ActionStatus ManageMasterWidget(Entity.MasterWidget request);
        public List<Entity.MasterWidget> GetMasterWidget();
        public Entity.MasterWidget GetMasterWidgetById(Guid Id);
        Entity.ActionStatus DeleteMasterWidget(Guid id);

        public Entity.ActionStatus ManageUserWidget(Entity.UserDasboardWidget request);
        public List<Entity.UserDasboardWidget> GetUserWidget();
        public Entity.UserDasboardWidget GetUserWidgetById(Guid Id);
        Entity.ActionStatus DeleteUserWidget(Guid id);
        #endregion

    }
}
