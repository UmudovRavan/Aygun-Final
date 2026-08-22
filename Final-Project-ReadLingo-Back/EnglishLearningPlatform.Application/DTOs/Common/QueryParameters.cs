using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Common
{

    public class QueryParameters
    {
        private const int MaxPageSize = 100;
        private int _pageSize = 20;

        public int PageNumber { get; set; } = 1;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? 1 : value;
        }

        public string? Search { get; set; }

        public string? SortBy { get; set; }

        public bool Descending { get; set; }
    }

}
