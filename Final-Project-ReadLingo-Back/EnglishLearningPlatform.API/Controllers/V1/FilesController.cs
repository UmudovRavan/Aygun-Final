using Asp.Versioning;
using EnglishLearningPlatform.Application.Common;
using EnglishLearningPlatform.Application.Exceptions;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    public enum UploadContainer
    {
        ProfilePictures,
        StoryCovers,
        ChapterAudio,
        VocabularyImages,
        VocabularyAudio,
    }

    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/files")]
    [Authorize]
    public class FilesController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;

        public FilesController(IFileStorageService fileStorageService)
        {
            _fileStorageService = fileStorageService;
        }

        private static string ContainerFolder(UploadContainer container) => container switch
        {
            UploadContainer.ProfilePictures => "profile-pictures",
            UploadContainer.StoryCovers => "story-covers",
            UploadContainer.ChapterAudio => "chapter-audio",
            UploadContainer.VocabularyImages => "vocabulary-images",
            UploadContainer.VocabularyAudio => "vocabulary-audio",
            _ => "misc",
        };

        [HttpPost("images")]
        [RequestSizeLimit(FileValidationOptions.MaxImageSizeBytes)]
        public async Task<IActionResult> UploadImage(
            IFormFile file, [FromQuery] UploadContainer container, CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
                throw new FileUploadException("No file was uploaded.");

            FileValidator.ValidateImage(file.FileName, file.Length, file.ContentType);

            await using var stream = file.OpenReadStream();
            var url = await _fileStorageService.UploadAsync(stream, file.FileName, ContainerFolder(container), cancellationToken);

            return Ok(Application.Responses.Result<string>.Success(url, "Image uploaded."));
        }

        [HttpPost("audio")]
        [RequestSizeLimit(FileValidationOptions.MaxAudioSizeBytes)]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> UploadAudio(
            IFormFile file, [FromQuery] UploadContainer container, CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
                throw new FileUploadException("No file was uploaded.");

            FileValidator.ValidateAudio(file.FileName, file.Length, file.ContentType);

            await using var stream = file.OpenReadStream();
            var url = await _fileStorageService.UploadAsync(stream, file.FileName, ContainerFolder(container), cancellationToken);

            return Ok(Application.Responses.Result<string>.Success(url, "Audio file uploaded."));
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Delete([FromQuery] string fileUrl, CancellationToken cancellationToken)
        {
            var deleted = await _fileStorageService.DeleteAsync(fileUrl, cancellationToken);
            return deleted
                ? Ok(Application.Responses.Result.Success("File deleted."))
                : NotFound(Application.Responses.Result.Failure("File not found."));
        }
    }
}
