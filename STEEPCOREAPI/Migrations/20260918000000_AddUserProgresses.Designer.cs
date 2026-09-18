using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using STEEPCOREAPI.Shared.Database;
using System;

namespace STEEPCOREAPI.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260918000000_AddUserProgresses")]
    partial class AddUserProgresses
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            // We just need the attribute to let EF know this migration exists.
#pragma warning restore 612, 618
        }
    }
}
