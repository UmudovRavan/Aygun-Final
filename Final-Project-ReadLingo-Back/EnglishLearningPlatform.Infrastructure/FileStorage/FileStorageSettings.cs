using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.FileStorage
{
    public class FileStorageSettings
    {
        public const string SectionName = "FileStorage";

        public string RootPath { get; set; } = "wwwroot/uploads";
        public string BaseUrl { get; set; } = "/uploads";
    }
}
