CREATE TABLE [dbo].[Product] (
    [guid]             UNIQUEIDENTIFIER NOT NULL,
    [companyGuid]      UNIQUEIDENTIFIER NOT NULL,
    [productTypeGuid]  UNIQUEIDENTIFIER   NOT NULL,
    [name]             NVARCHAR (500)   NOT NULL,
    [image]            NVARCHAR (200)   NULL,
    [isActive]         BIT              CONSTRAINT [DF__Product__isactive__5165187F] DEFAULT ((1)) NOT NULL,
    [isDeleted]        BIT              CONSTRAINT [DF__Product__isdelete__52593CB8] DEFAULT ((0)) NOT NULL,
    [createdDate]      DATETIME         NULL,
    [createdBy]        UNIQUEIDENTIFIER NULL,
    [updatedDate]      DATETIME         NULL,
    [updatedBy]        UNIQUEIDENTIFIER NULL,
    CONSTRAINT [PK__Product__497F6CB4A9E84FFD] PRIMARY KEY CLUSTERED ([guid] ASC)
);

