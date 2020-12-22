CREATE TABLE [dbo].[ProductType]
(
	[guid] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY
	, [typeName] NVARCHAR(100) NOT NULL
	,[isActive]         BIT              DEFAULT ((1)) NOT NULL,
    [isDeleted]        BIT              DEFAULT ((0)) NOT NULL,
    [createdDate]      DATETIME         NULL,
    [createdBy]        UNIQUEIDENTIFIER NULL,
    [updatedDate]      DATETIME         NULL,
    [updatedBy]        UNIQUEIDENTIFIER NULL
)
