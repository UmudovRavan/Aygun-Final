using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.FileStorage
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly FileStorageSettings _settings;
        private readonly ILogger<LocalFileStorageService> _logger;

        public LocalFileStorageService(IOptions<FileStorageSettings> settings, ILogger<LocalFileStorageService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<string> UploadAsync(
            Stream fileStream, string fileName, string containerName, CancellationToken cancellationToken = default)
        {
            var safeContainer = containerName.Trim('/', '\\');
            var directory = Path.Combine(_settings.RootPath, safeContainer);
            Directory.CreateDirectory(directory);

            var extension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
            var fullPath = Path.Combine(directory, uniqueFileName);

            await using (var output = File.Create(fullPath))
            {
                await fileStream.CopyToAsync(output, cancellationToken);
            }

            var publicUrl = $"{_settings.BaseUrl.TrimEnd('/')}/{safeContainer}/{uniqueFileName}";
            _logger.LogInformation("Stored file at {Path}, public URL {Url}", fullPath, publicUrl);
            return publicUrl;
        }

        public Task<bool> DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
        {
            try
            {
                var relativePath = fileUrl.Replace(_settings.BaseUrl, string.Empty).TrimStart('/');
                var fullPath = Path.Combine(_settings.RootPath, relativePath);

                if (!File.Exists(fullPath))
                    return Task.FromResult(false);

                File.Delete(fullPath);
                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete file {FileUrl}", fileUrl);
                return Task.FromResult(false);
            }
        }
    }
}
