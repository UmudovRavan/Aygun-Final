using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.Caching
{
    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private static readonly ConcurrentDictionary<string, byte> TrackedKeys = new();
        private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(5);

        public MemoryCacheService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        {
            _cache.TryGetValue(key, out T? value);
            return Task.FromResult(value);
        }

        public Task SetAsync<T>(
            string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
        {
            _cache.Set(key, value, expiration ?? DefaultExpiration);
            TrackedKeys.TryAdd(key, 0);
            return Task.CompletedTask;
        }

        public async Task<T> GetOrCreateAsync<T>(
            string key,
            Func<CancellationToken, Task<T>> factory,
            TimeSpan? expiration = null,
            CancellationToken cancellationToken = default)
        {
            if (_cache.TryGetValue(key, out T? cached) && cached != null)
                return cached;

            var value = await factory(cancellationToken);
            await SetAsync(key, value, expiration, cancellationToken);
            return value;
        }

        public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            _cache.Remove(key);
            TrackedKeys.TryRemove(key, out _);
            return Task.CompletedTask;
        }

        public Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
        {
            foreach (var key in TrackedKeys.Keys.Where(k => k.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)).ToList())
            {
                _cache.Remove(key);
                TrackedKeys.TryRemove(key, out _);
            }

            return Task.CompletedTask;
        }
    }
}
