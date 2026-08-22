using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Common
{
    public static class FileValidationOptions
    {
        public static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        public static readonly string[] AllowedImageContentTypes =
            { "image/jpeg", "image/png", "image/webp", "image/gif" };
        public const long MaxImageSizeBytes = 5 * 1024 * 1024;

        public static readonly string[] AllowedAudioExtensions = { ".mp3", ".wav", ".m4a", ".ogg" };
        public static readonly string[] AllowedAudioContentTypes =
            { "audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/ogg" };
        public const long MaxAudioSizeBytes = 20 * 1024 * 1024; 
    }
}
