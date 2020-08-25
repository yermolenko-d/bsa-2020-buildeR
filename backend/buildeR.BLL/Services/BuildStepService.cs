﻿using AutoMapper;
using AutoMapper.QueryableExtensions;

using buildeR.BLL.Exceptions;
using buildeR.BLL.Interfaces;
using buildeR.BLL.Services.Abstract;
using buildeR.Common.DTO.BuildPlugin;
using buildeR.Common.DTO.BuildStep;
using buildeR.Common.DTO.PluginCommand;
using buildeR.DAL.Context;
using buildeR.DAL.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace buildeR.BLL.Services
{
    public class BuildStepService : BaseCrudService<BuildStep, BuildStepDTO, NewBuildStepDTO>, IBuildStepService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        public BuildStepService(BuilderContext context, IMapper mapper, IMemoryCache cache, IHttpClientFactory factory) : base(context, mapper)
        {
            _httpClient = factory.CreateClient();
            _cache = cache;
        }
        public async Task<BuildStepDTO> GetBuildStepById(int id)
        {
            var buildStep = await base.GetAsync(id);
            if (buildStep == null)
            {
                throw new NotFoundException(nameof(BuildStep), id);
            }
            return buildStep;
        }
        public async Task<IEnumerable<BuildStepDTO>> GetAll()
        {
            return await base.GetAllAsync();
        }

        public async Task<BuildStepDTO> Create(NewBuildStepDTO buildStep)
        {
            if (buildStep == null)
            {
                throw new ArgumentNullException();
            }
            return await base.AddAsync(buildStep);
        }
        public async Task Update(BuildStepDTO buildStep)
        {
            if (buildStep == null)
            {
                throw new ArgumentNullException();
            }
            await base.UpdateAsync(buildStep);
        }
        public async Task Delete(int id)
        {
            var stepToDelete = await base.GetAsync(id);
            if (stepToDelete == null)
            {
                throw new NotFoundException(nameof(BuildStep), id);
            }

            //Need to change indexes of other build steps 
            var projectBuildStepsWithIndexMoreBuildStepToDelete = await Context
                .BuildSteps
                .AsNoTracking()
                .Where(buildStep => buildStep.ProjectId == stepToDelete.ProjectId && buildStep.Index > stepToDelete.Index)
                .ToListAsync();

            foreach (var buildStep in projectBuildStepsWithIndexMoreBuildStepToDelete)
            {
                --buildStep.Index;
                Context.Entry(buildStep).State = EntityState.Modified;
            }

            await base.RemoveAsync(id);
        }

        public async Task<IEnumerable<EmptyBuildStepDTO>> GetEmptyBuildStepsAsync()
        {
            var buildPlugins = await Context.Set<BuildPlugin>().ToListAsync();
            var pluginCommands = await Context.Set<PluginCommand>().ToListAsync();
            return buildPlugins
                .Join(pluginCommands,
                    buildPlugin => buildPlugin.Id,
                    pluginCommand => pluginCommand.PluginId,
                    (buildPlugin, pluginCommand) => new EmptyBuildStepDTO()
                    {
                        BuildStepName = $"{buildPlugin.PluginName}: {pluginCommand.Name}",
                        BuildPluginId = buildPlugin.Id,
                        BuildPlugin = Mapper.Map<BuildPluginDTO>(buildPlugin),
                        PluginCommand = Mapper.Map<PluginCommandDTO>(pluginCommand),
                        PluginCommandId = pluginCommand.Id,
                        Versions = GetDockerImageVersions(buildPlugin.Id, buildPlugin.DockerRegistryName).Result
                    }
                );
        }

        public async Task<IEnumerable<string>> GetDockerImageVersions(int id, string image)
        {
            IEnumerable<string> versions = null;
            if (!_cache.TryGetValue(id, out versions))
            {
                var response = await _httpClient.GetAsync($"https://registry.hub.docker.com/v1/repositories/{image}/tags");
                var result = await response.Content.ReadAsStringAsync();
                var fullTags = JsonConvert.DeserializeObject<IEnumerable<DockerImageVersion>>(result);
                versions = fullTags.Select(x => x.Name);
                if (versions != null)
                {
                    _cache.Set(id, versions,
                        new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(60)));
                }
            }
            return versions;
        }

        public async Task<IEnumerable<BuildStepDTO>> GetBuildStepsByProjectIdAsync(int projectId)
        {
            return await Context
                .BuildSteps
                .Where(buildStep => buildStep.ProjectId == projectId)
                .OrderBy(buildStep => buildStep.Index)
                .ProjectTo<BuildStepDTO>(Mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task UpdateIndexesOfBuildStepsAsync(int projectId, int newIndex, int oldIndex)
        {
            var movedBuildStep = await Context
                .BuildSteps
                .AsNoTracking()
                .FirstOrDefaultAsync(buildStep => buildStep.ProjectId == projectId && buildStep.Index == oldIndex);

            movedBuildStep.Index = newIndex;
            Context.Entry(movedBuildStep).State = EntityState.Modified;

            var buildStepsToIncreaseIndex = await Context
                .BuildSteps
                .AsNoTracking()
                .Where(buildStep => buildStep.ProjectId == projectId &&
                                    buildStep.Index >= newIndex &&
                                    buildStep.Index < oldIndex)
                .ToListAsync();

            foreach (var buildStep in buildStepsToIncreaseIndex)
            {
                ++buildStep.Index;
                Context.Entry(buildStep).State = EntityState.Modified;
            }

            await Context.SaveChangesAsync();
        }
    }
}
