using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Repositories
{

    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
    {
        protected readonly ApplicationDbContext Context;
        protected readonly DbSet<TEntity> DbSet;

        public GenericRepository(ApplicationDbContext context)
        {
            Context = context;
            DbSet = context.Set<TEntity>();
        }

        public async Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            await DbSet.FindAsync(new object[] { id }, cancellationToken);

        public async Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default) =>
            await DbSet.AsNoTracking().ToListAsync(cancellationToken);

        public async Task<IReadOnlyList<TEntity>> FindAsync(
            Expression<Func<TEntity, bool>> predicate,
            CancellationToken cancellationToken = default) =>
            await DbSet.AsNoTracking().Where(predicate).ToListAsync(cancellationToken);

        public async Task<TEntity?> SingleOrDefaultAsync(
            Expression<Func<TEntity, bool>> predicate,
            CancellationToken cancellationToken = default) =>
            await DbSet.FirstOrDefaultAsync(predicate, cancellationToken);

        public IQueryable<TEntity> Query() => DbSet.AsQueryable();

        public async Task<bool> AnyAsync(
            Expression<Func<TEntity, bool>> predicate,
            CancellationToken cancellationToken = default) =>
            await DbSet.AnyAsync(predicate, cancellationToken);

        public async Task<int> CountAsync(
            Expression<Func<TEntity, bool>>? predicate = null,
            CancellationToken cancellationToken = default) =>
            predicate is null
                ? await DbSet.CountAsync(cancellationToken)
                : await DbSet.CountAsync(predicate, cancellationToken);

        public async Task AddAsync(TEntity entity, CancellationToken cancellationToken = default) =>
            await DbSet.AddAsync(entity, cancellationToken);

        public async Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default) =>
            await DbSet.AddRangeAsync(entities, cancellationToken);

        public void Update(TEntity entity) => DbSet.Update(entity);

        public void Remove(TEntity entity) => DbSet.Remove(entity);

        public void RemoveRange(IEnumerable<TEntity> entities) => DbSet.RemoveRange(entities);

        public async Task<(IReadOnlyList<TEntity> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            Expression<Func<TEntity, bool>>? predicate = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            CancellationToken cancellationToken = default)
        {
            IQueryable<TEntity> query = DbSet.AsNoTracking();

            if (predicate != null)
                query = query.Where(predicate);

            var totalCount = await query.CountAsync(cancellationToken);

            query = orderBy != null ? orderBy(query) : query;

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }
    }
}