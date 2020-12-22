using System;

namespace iot.solution.entity
{
    public class AddCompanyRequest : Company
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Guid UserID { get; set; }
        public Guid CompanyGuid { get; set; }
        public Guid RoleGuid { get; set; }
    }
}
