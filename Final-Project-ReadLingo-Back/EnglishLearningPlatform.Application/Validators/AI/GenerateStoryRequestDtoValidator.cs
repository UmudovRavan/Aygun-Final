using EnglishLearningPlatform.Application.DTOs.AI;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Validators.AI
{
    public class GenerateStoryRequestDtoValidator : AbstractValidator<GenerateStoryRequestDto>
    {
        public GenerateStoryRequestDtoValidator()
        {
            RuleFor(x => x.Prompt).NotEmpty().MaximumLength(1000);
            RuleFor(x => x.Level).NotEmpty().Must(l => new[] { "A1", "A2", "B1", "B2", "C1", "C2" }.Contains(l.ToUpperInvariant()))
                .WithMessage("Level must be a valid CEFR level (A1, A2, B1, B2, C1, C2).");
            RuleFor(x => x.Topic).NotEmpty().MaximumLength(100);
            RuleFor(x => x.WordCount).InclusiveBetween(100, 5000);
            RuleFor(x => x.QuizQuestionCount).InclusiveBetween(0, 20);
        }
    }
}
