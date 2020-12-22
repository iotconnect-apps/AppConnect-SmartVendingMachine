CREATE TABLE [dbo].[UserDasboardWidget](
[Guid] [uniqueidentifier] NOT NULL PRIMARY KEY,
[DashboardName] [nvarchar](100) NULL,
[Widgets] [text] NOT NULL,
[IsDefault] [bit] NOT NULL,
[IsSystemDefault] [bit] NOT NULL,
[UserId] [uniqueidentifier] NOT NULL,
[IsActive] [bit] NOT NULL,
[IsDeleted] [bit] NOT NULL,
[CreatedDate] [datetime] NULL,
[CreatedBy] [uniqueidentifier] NULL,
[ModifiedDate] [datetime] NULL,
[ModifiedBy] [uniqueidentifier] NULL
)
