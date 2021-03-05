using System.Collections.Generic;
using System.Threading.Tasks;
namespace component.helper.Interface
{
    public interface IEmailHelper
    {
        Task SendCompanyRegistrationEmail(string userName, string companyName, string userId, string password);
        Task SendSubscriptionOverEmail(string userName, string expiryDate, string userEmail);
        Task SendCompanyRegistrationAdminEmail(string userName, string companyName, string userId, string address, string contactNo);
    }
}
