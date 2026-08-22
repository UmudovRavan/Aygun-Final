using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IFileStorageService
    {
        Task<string> UploadAsync(Stream fileStream, string fileName, string containerName, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string fileUrl, CancellationToken cancellationToken = default);
    }
}
