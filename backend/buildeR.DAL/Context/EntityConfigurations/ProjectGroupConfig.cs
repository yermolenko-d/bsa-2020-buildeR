﻿using buildeR.DAL.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;

namespace buildeR.DAL.Context.EntityConfigurations
{
    public class ProjectGroupConfig : IEntityTypeConfiguration<ProjectGroup>
    {
        public void Configure(EntityTypeBuilder<ProjectGroup> entity)
        {
            entity.HasOne(e => e.Group)
                .WithMany(g => g.ProjectGroups)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Project)
                .WithMany(g => g.ProjectGroups)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
