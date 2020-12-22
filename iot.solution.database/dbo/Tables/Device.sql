﻿CREATE TABLE [dbo].[Device] (
    [guid]             UNIQUEIDENTIFIER NOT NULL,
    [companyGuid]      UNIQUEIDENTIFIER NOT NULL,
    [entityGuid]       UNIQUEIDENTIFIER NOT NULL,
    [templateGuid]     UNIQUEIDENTIFIER NOT NULL,
    [parentDeviceGuid] UNIQUEIDENTIFIER NULL,
    [typeGuid]         UNIQUEIDENTIFIER NOT NULL,
    [uniqueId]         NVARCHAR (500)   NOT NULL,
    [name]             NVARCHAR (500)   NOT NULL,
    [description]      NVARCHAR (1000)  NULL,
    [specification]    NVARCHAR (1000)  NULL,
    [note]             NVARCHAR (1000)  NULL,
    [tag]              NVARCHAR (50)    NULL,
    [image]            NVARCHAR (200)   NULL,
    [isProvisioned]    BIT              DEFAULT ((0)) NOT NULL,
    [isActive]         BIT              DEFAULT ((1)) NOT NULL,
    [isDeleted]        BIT              DEFAULT ((0)) NOT NULL,
    [createdDate]      DATETIME         NULL,
    [createdBy]        UNIQUEIDENTIFIER NULL,
    [updatedDate]      DATETIME         NULL,
    [updatedBy]        UNIQUEIDENTIFIER NULL,
    PRIMARY KEY CLUSTERED ([guid] ASC)
);

