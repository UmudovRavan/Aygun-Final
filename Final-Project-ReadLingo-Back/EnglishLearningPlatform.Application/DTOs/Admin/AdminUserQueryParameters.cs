using EnglishLearningPlatform.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Admin
{
    public class AdminUserQueryParameters : QueryParameters
    {
        public string? Role { get; set; }

        public bool? IsActive { get; set; }
    }
}
