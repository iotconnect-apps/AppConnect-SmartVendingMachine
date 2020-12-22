using host.iot.solution.Filter;
using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;

namespace host.iot.solution.Controllers
{
    [Route(RuleRoute.Route.Global)]
    public class RuleController : BaseController
    {
        private readonly IRuleService _service;

        public RuleController(IRuleService ruleService)
        {
            _service = ruleService;
        }

        [HttpGet]
        [Route(RuleRoute.Route.GetById, Name = RuleRoute.Name.GetById)]
        [EnsureGuidParameterAttribute("id", "Rule")]
        public Entity.BaseResponse<Entity.SingleRuleResponse> Get(string id)
        {
            Entity.BaseResponse<Entity.SingleRuleResponse> response = new Entity.BaseResponse<Entity.SingleRuleResponse>(true);
            try
            {
                response.Data = _service.Get(Guid.Parse(id));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.SingleRuleResponse>(false, ex.Message);
            }
            return response;
        }

        [HttpPost]
        [Route(RuleRoute.Route.Manage, Name = RuleRoute.Name.Manage)]
        public Entity.BaseResponse<Entity.SingleRuleResponse> Manage([FromBody]Entity.Rule request)
        {
            if (request == null)
            {
                return new Entity.BaseResponse<Entity.SingleRuleResponse>(false, "Invalid Request");
            }

            Entity.BaseResponse<Entity.SingleRuleResponse> response = new Entity.BaseResponse<Entity.SingleRuleResponse>(true);
            try
            {
                var status = _service.Manage(request);
                response.IsSuccess = status.Success;
                response.Message = status.Message;
                response.Data = status.Data;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.SingleRuleResponse>(false, ex.Message);
            }
            return response;
        }

        [HttpPost]
        [Route(RuleRoute.Route.Verify, Name = RuleRoute.Name.Verify)]
        public Entity.BaseResponse<Entity.VerifyRuleResult> Verify([FromBody]Entity.VerifyRuleRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.deviceTemplateGuid) || string.IsNullOrWhiteSpace(request.expression))
            {
                return new Entity.BaseResponse<Entity.VerifyRuleResult>(false, "Invalid Request");
            }

            Entity.BaseResponse<Entity.VerifyRuleResult> response = new Entity.BaseResponse<Entity.VerifyRuleResult>(true);
            try
            {
                var verifySatus = _service.Verify(request);
                response.IsSuccess = verifySatus.Success;
                response.Message = verifySatus.Message;
                response.Data = verifySatus.Data;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.VerifyRuleResult>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(RuleRoute.Route.List, Name = RuleRoute.Name.List)]
        public Entity.BaseResponse<Entity.SearchResult<List<Entity.AllRuleResponse>>> GetBySearch(string searchText = "", int? pageNo = 1, int? pageSize = 10, string orderBy = "")
        {
            Entity.BaseResponse<Entity.SearchResult<List<Entity.AllRuleResponse>>> response = new Entity.BaseResponse<Entity.SearchResult<List<Entity.AllRuleResponse>>>(true);
            try
            {
                response.Data = _service.List(new Entity.SearchRequest()
                {
                    SearchText = searchText,
                    PageNumber = pageNo.Value,
                    PageSize = pageSize.Value,
                    OrderBy = orderBy
                });
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.SearchResult<List<Entity.AllRuleResponse>>>(false, ex.Message);
            }
            return response;
        }

        [HttpPut]
        [Route(RuleRoute.Route.Delete, Name = RuleRoute.Name.Delete)]
        [EnsureGuidParameterAttribute("id", "Rule")]
        public Entity.BaseResponse<bool> Delete(string id)
        {
            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                var status = _service.Delete(Guid.Parse(id));
                response.IsSuccess = status.Success;
                response.Message = status.Message;
                response.Data = status.Success;
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