using component.logger;
using component.messaging.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Reflection;
using LogHandler = component.services.loghandler;
using System.IdentityModel.Tokens.Jwt;
using component.helper.Interface;
using component.helper;
using System.Xml;
using Entity = iot.solution.entity;

namespace component.messaging.Database
{
    public class DatabaseManager : IDatabaseManager
    {
        private readonly string _connectionString;
        private readonly LogHandler.Logger _logger;
        private readonly IHttpClientHelper _httpClientHelper;
        private static string _subcriptionAccessToken;
        private readonly string apiBaseURL = String.Empty;
        public DatabaseManager(string connectionString, LogHandler.Logger logger)
        {
            _connectionString = connectionString;
            _logger = logger;
            _httpClientHelper = new HttpClientHelper(logger);
            apiBaseURL = SolutionConfiguration.Configuration.SubscriptionAPI.BaseUrl;
            InitSubscriptionToken();
        }

        public void CompanyProcessMessage(MessageModel subscribeData)
        {
            try
            {
                var xmlCompanyData = Convert.ToString(JsonConvert.DeserializeXNode(JsonConvert.SerializeObject(subscribeData.Data), "items"));

                var baseDataAccess = new BaseDataAccess(_connectionString);
                var sqlParameters = new List<SqlParameter>()
                {
                   baseDataAccess.AddInParameter("ComapnyXml", xmlCompanyData),
                   baseDataAccess.AddInParameter("action", subscribeData.Action),
                   baseDataAccess.AddInParameter("companyGuid", subscribeData.Company)
                };
                baseDataAccess.Execute("IotConnect_ManageCompany", sqlParameters);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(new Exception($"Error in sync iotconnect company data : {ex.Message}, StackTrace : {ex.StackTrace}, Data : {JsonConvert.SerializeObject(subscribeData)}"), this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
        }

        public void TemplateProcessMessage(MessageModel subscribeData)
        {
            //try
            //{
            //    var xmlTemplateData = Convert.ToString(JsonConvert.DeserializeXNode(JsonConvert.SerializeObject(subscribeData.Data), "items"));
            //    var baseDataAccess = new BaseDataAccess(_connectionString);
            //    var sqlParameters = new List<SqlParameter>
            //    {
            //        baseDataAccess.AddInParameter("DeviceTemplateXml", xmlTemplateData),
            //        baseDataAccess.AddInParameter("action", subscribeData.Action),
            //        baseDataAccess.AddInParameter("companyGuid", subscribeData.Company)
            //    };
            //    baseDataAccess.Execute("IotConnect_ManageDeviceTemplate ", sqlParameters);
            //}
            //catch (Exception ex)
            //{
            //    _logger.ErrorLog(new Exception($"Error in sync iotconnect template data : {ex.Message}, StackTrace : {ex.StackTrace}, Data : {JsonConvert.SerializeObject(subscribeData)}"), this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            //}
        }
        public void EntityProcessMessage(MessageModel subscribeData)
        {
            try
            {
                
                var xmlEntityData = Convert.ToString(JsonConvert.DeserializeXNode(JsonConvert.SerializeObject(subscribeData.Data), "items"));
                var baseDataAccess = new BaseDataAccess(_connectionString);
                var sqlParameters = new List<SqlParameter>
                {
                    baseDataAccess.AddInParameter("EntityXml", xmlEntityData),
                    baseDataAccess.AddInParameter("action", subscribeData.Action),
                    baseDataAccess.AddInParameter("companyGuid", subscribeData.Company)
                };
                baseDataAccess.Execute("IotConnect_ManageEntity", sqlParameters);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(new Exception($"Error in sync iotconnect entity data : {ex.Message}, StackTrace : {ex.StackTrace}, Data : {JsonConvert.SerializeObject(subscribeData)}"), this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
        }

        public void UserProcessMessage(MessageModel subscribeData)
        {
            try
            {
                var xmlUserData = Convert.ToString(JsonConvert.DeserializeXNode(JsonConvert.SerializeObject(subscribeData.Data), "items"));
                //check and update expirydate
                Entity.SubsciberCompanyDetails result = new Entity.SubsciberCompanyDetails();
                string userEmail = string.Empty;
                try
                {
                    XmlDocument xmlDoc = new XmlDocument();
                    xmlDoc.LoadXml(xmlUserData);
                    string xpath = "items/item";
                    var nodes = xmlDoc.SelectNodes(xpath);
                    foreach (XmlNode childrenNode in nodes)
                    {
                        userEmail = childrenNode.SelectSingleNode("//userid").InnerText;
                    }

                    result = _httpClientHelper.Get<Entity.SubsciberCompanyDetails>(string.Format("{0}subscriber/{1}/{2}/consumption/active", apiBaseURL, SolutionConfiguration.Configuration.SubscriptionAPI.SolutionId, userEmail), _subcriptionAccessToken);
                }
                catch (Exception ex)
                {
                    _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                }
                var baseDataAccess = new BaseDataAccess(_connectionString);
                var sqlParameters = new List<SqlParameter>
                {
                    baseDataAccess.AddInParameter("UserXml", xmlUserData),
                    baseDataAccess.AddInParameter("action", subscribeData.Action),
                    baseDataAccess.AddInParameter("companyGuid", subscribeData.Company),
                    baseDataAccess.AddInParameter("renewalDate",((result!=null && result.renewalDate!=null) ? result.renewalDate:null))
                };
                baseDataAccess.Execute("IotConnect_ManageUser ", sqlParameters);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(new Exception($"Error in sync iotconnect user data : {ex.Message}, StackTrace : {ex.StackTrace}, Data : {JsonConvert.SerializeObject(subscribeData)}"), this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
        }

        private bool ValidateSubscriptionAccessToken()
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(_subcriptionAccessToken))
                {
                    JwtSecurityTokenHandler jwthandler = new JwtSecurityTokenHandler();
                    Microsoft.IdentityModel.Tokens.SecurityToken jwttoken = jwthandler.ReadToken(_subcriptionAccessToken);

                    if (jwttoken.ValidTo < DateTime.UtcNow.AddMinutes(5))
                        return false;
                    else
                        return true;
                }
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return false;
        }
        private void InitSubscriptionToken()
        {
            try
            {
                if (!ValidateSubscriptionAccessToken())
                {
                    Entity.TokenRequest request = new Entity.TokenRequest
                    {
                        ClientID = SolutionConfiguration.Configuration.SubscriptionAPI.ClientID,
                        ClientSecret = SolutionConfiguration.Configuration.SubscriptionAPI.ClientSecret,
                        UserName = SolutionConfiguration.Configuration.SubscriptionAPI.UserName
                    };
                    Entity.TokenResponse response = new Entity.TokenResponse();
                    response = _httpClientHelper.Post<Entity.TokenRequest, Entity.TokenResponse>(apiBaseURL + "subscription/token", request);
                    _subcriptionAccessToken = response.accessToken;
                }
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
        }

        public void RoleProcessMessage(MessageModel subscribeData)
        {
            try
            {
                var xmlRoleData = Convert.ToString(JsonConvert.DeserializeXNode(JsonConvert.SerializeObject(subscribeData.Data), "items"));
                var baseDataAccess = new BaseDataAccess(_connectionString);
                var sqlParameters = new List<SqlParameter>
                {
                    baseDataAccess.AddInParameter("RoleXml", xmlRoleData),
                    baseDataAccess.AddInParameter("action", subscribeData.Action),
                    baseDataAccess.AddInParameter("companyGuid", subscribeData.Company)
                };
                baseDataAccess.Execute("IotConnect_ManageRole", sqlParameters);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(new Exception($"Error in sync iotconnect role data : {ex.Message}, StackTrace : {ex.StackTrace}, Data : {JsonConvert.SerializeObject(subscribeData)}"), this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
        }

        public void DeviceProcessMessage(MessageModel subscribeData)
        {
            try
            {
                var xmlDeviceData = Convert.ToString(JsonConvert.DeserializeXNode(JsonConvert.SerializeObject(subscribeData.Data)));
                var baseDataAccess = new BaseDataAccess(_connectionString);
                var sqlParameters = new List<SqlParameter>
                {
                    baseDataAccess.AddInParameter("DeviceXml", xmlDeviceData),
                    baseDataAccess.AddInParameter("action", subscribeData.Action),
                    baseDataAccess.AddInParameter("companyGuid", subscribeData.Company)
                };
                baseDataAccess.Execute("IotConnect_ManageDevice", sqlParameters);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(new Exception($"Error in sync iotconnect device data : {ex.Message}, StackTrace : {ex.StackTrace}, Data : {JsonConvert.SerializeObject(subscribeData)}"), this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
        }
    }
}
