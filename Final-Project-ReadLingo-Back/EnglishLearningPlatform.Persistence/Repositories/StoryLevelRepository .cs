using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Repositories
{
    public class StoryLevelRepository : GenericRepository<StoryLevel>, IStoryLevelRepository
    {
        public StoryLevelRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
