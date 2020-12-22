using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;
using host.iot.solution.Controllers;
using System.Xml.Serialization;
using System.Xml;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Text;

namespace iot.solution.host.Controllers
{
    [Route(AlertRoute.Route.Global)]
    [ApiController]
    public class AlertController : BaseController
    {
        private readonly IRuleService _ruleService;

        public AlertController(IRuleService ruleService)
        {
            _ruleService = ruleService;
        }

        [HttpPost]
        [AllowAnonymous]
        [Route(AlertRoute.Route.Manage, Name = AlertRoute.Name.Manage)]
        public Entity.BaseResponse<bool> Manage()
        {
            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
                {
                    string strRequest = reader.ReadToEndAsync().Result;
                    Entity.IOTAlertMessage objRequest = Newtonsoft.Json.JsonConvert.DeserializeObject<Entity.IOTAlertMessage>(strRequest);
                    if (!string.IsNullOrWhiteSpace(strRequest))
                    {
                        XmlSerializer xsSubmit = new XmlSerializer(typeof(Entity.IOTAlertMessage));
                        string xml = "";
                        using (var sww = new StringWriter())
                        {
                            using (XmlWriter writer = XmlWriter.Create(sww))
                            {
                                xsSubmit.Serialize(writer, objRequest);
                                xml = sww.ToString();
                            }
                        }
                        _ruleService.ManageWebHook(xml);
                        response.IsSuccess = true;
                    }
                }
            }
            catch (Exception ex)
            {
                return new Entity.BaseResponse<bool>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(AlertRoute.Route.List, Name = AlertRoute.Name.List)]
        public Entity.BaseResponse<Entity.SearchResult<List<Entity.AlertResponse>>> GetBySearch(string deviceGuid = "", string entityGuid = "", int? pageNo = 1, int? pageSize = 10, string orderBy = "")
        {
            Entity.BaseResponse<Entity.SearchResult<List<Entity.AlertResponse>>> response = new Entity.BaseResponse<Entity.SearchResult<List<Entity.AlertResponse>>>(true);
            try
            {
                response.Data = _ruleService.AlertList(new Entity.AlertRequest()
                {
                    DeviceGuid = deviceGuid,
                    EntityGuid = entityGuid,
                    OrderBy = orderBy,
                    PageNumber = pageNo,
                    PageSize = pageSize
                });

            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.SearchResult<List<Entity.AlertResponse>>>(false, ex.Message);
            }
            return response;
        }
    }
}