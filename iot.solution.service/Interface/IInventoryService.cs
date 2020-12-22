using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Response = iot.solution.entity.Response;

namespace iot.solution.service.Interface
{
   public interface IInventoryService
    {
        //List<Entity.Inventory> Get();
        Entity.InventoryDetail Get(Guid id);
        Entity.ActionStatus Manage(Entity.Inventory inventory);

        //Entity.ActionStatus Delete(Guid id);
        Entity.ActionStatus ClearShelf(Guid inventoryId);
        Entity.SearchResult<List<Entity.InventoryDetail>> List(Entity.SearchRequest request);
        Entity.InventoryHistoryDetail HistoryDetail(Guid deviceItemGuid);
    }
}
