CREATE TABLE [dbo].[Inventory]
(
	[guid] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY, 
    [companyGuid] UNIQUEIDENTIFIER NOT NULL, 
    [entityGuid] UNIQUEIDENTIFIER NOT NULL, 
    [deviceGuid] UNIQUEIDENTIFIER NULL, 
    [productGuid] UNIQUEIDENTIFIER NULL, 
    [refillDateTime] DATETIME NULL, 
    [quantity] BIGINT NULL,
	[deviceItemGuid] UNIQUEIDENTIFIER NULL,	
	[isActive]         BIT              CONSTRAINT [DF__Inventory__isactive__5165187F] DEFAULT ((1)) NOT NULL,
    [isDeleted]        BIT              CONSTRAINT [DF__Inventory__isdelete__52593CB8] DEFAULT ((0)) NOT NULL,
    [createdDate]      DATETIME         NULL,
    [createdBy]        UNIQUEIDENTIFIER NULL,
    [updatedDate]      DATETIME         NULL,
    [updatedBy]        UNIQUEIDENTIFIER NULL
)
