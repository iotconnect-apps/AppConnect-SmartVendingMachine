using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity
{
    public class AddAdminUserRequest
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string ContactNo{ get; set; }

        public string Password { get; set; }

        //public string CompanyGuid { get; set; }
    }
}
