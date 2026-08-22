using EnglishLearningPlatform.Application.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Common
{
    public static class FileValidator
    {
        public static void ValidateImage(string fileName, long sizeInBytes, string contentType)
            => Validate(fileName, sizeInBytes, contentType,
                FileValidationOptions.AllowedImageExtensions,
                FileValidationOptions.AllowedImageContentTypes,
                FileValidationOptions.MaxImageSizeBytes,
                "image");

        public static void ValidateAudio(string fileName, long sizeInBytes, string contentType)
            => Validate(fileName, sizeInBytes, contentType,
                FileValidationOptions.AllowedAudioExtensions,
                FileValidationOptions.AllowedAudioContentTypes,
                FileValidationOptions.MaxAudioSizeBytes,
                "audio");

        private static void Validate(
            string fileName,
            long sizeInBytes,
            string contentType,
            string[] allowedExtensions,
            string[] allowedContentTypes,
            long maxSizeBytes,
            string kind)
        {
            if (sizeInBytes <= 0)
                throw new FileUploadException("The uploaded file is empty.");

            if (sizeInBytes > maxSizeBytes)
                throw new FileUploadException($"The {kind} file exceeds the maximum allowed size of {maxSizeBytes / 1024 / 1024} MB.");

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
                throw new FileUploadException($"File extension \"{extension}\" is not a supported {kind} format.");

            if (!string.IsNullOrEmpty(contentType) && !allowedContentTypes.Contains(contentType.ToLowerInvariant()))
                throw new FileUploadException($"Content type \"{contentType}\" is not a supported {kind} format.");
        }
    }


}
