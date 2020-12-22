CREATE TABLE [dbo].[MasterWidget](
[Guid] [uniqueidentifier] NOT NULL PRIMARY KEY,
[Widgets] [text],
[IsDeleted] [bit] NOT NULL,
[IsActive] [bit] NOT NULL,
[CreatedDate] [datetime] NOT NULL,
[CreatedBy] [uniqueidentifier] NOT NULL,
[ModifiedDate] [datetime] NULL,
[ModifiedBy] [uniqueidentifier] NULL
)