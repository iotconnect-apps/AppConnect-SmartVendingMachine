using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Response
{
    public class StompReaderData
    {
        public string cpId { get; set; }
        public string host { get; set; }
        public int isSecure { get; set; }
        public string password { get; set; }
        public int port { get; set; }
        public string url { get; set; }
        public string user { get; set; }
        public string vhost { get; set; }

    }
}
