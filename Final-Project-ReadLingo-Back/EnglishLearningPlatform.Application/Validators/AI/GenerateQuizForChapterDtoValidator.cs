using EnglishLearningPlatform.Application.DTOs.AI;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Validators.AI
{
    public class GenerateQuizForChapterDtoValidator : AbstractValidator<GenerateQuizForChapterDto>
    {
        public GenerateQuizForChapterDtoValidator()
        {
            RuleFor(x => x.ChapterId).NotEmpty();
            RuleFor(x => x.QuestionCount).InclusiveBetween(1, 20);
        }
    }
}
