using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;

namespace iot.solution.model.Repository.Interface
{
    public interface IInventoryRepository: IGenericRepository<Model.Inventory>
    {
        Entity.InventoryDetail Get(Guid id);
        Entity.ActionStatus Manage(Model.Inventory request, bool isClearShelf);
        Entity.SearchResult<List<Model.InventoryDetail>> List(Entity.SearchRequest request);
        List<Entity.InventoryHistoryDetail> HistoryDetail(Guid deviceItemGuid);
        Entity.ActionStatus UpdateInventory(Entity.Inventory request);
        Entity.ActionStatus ClearShelf(Model.Inventory request);
    }
}
