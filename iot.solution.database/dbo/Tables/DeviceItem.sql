CREATE TABLE [dbo].[DeviceItem]
(
	[guid]				UNIQUEIDENTIFIER NOT NULL PRIMARY KEY
	, [deviceGuid]		UNIQUEIDENTIFIER NOT NULL
	, [productTypeGuid] UNIQUEIDENTIFIER NOT NULL
	, [sequence]		NVARCHAR(3)			 NOT NULL
	, [uniqueId]		NVARCHAR(200)	 NOT NULL
	, [capacity]		BIGINT			 NULL
	, [availableQty]		BIGINT			 NULL
	, [isActive]        BIT              DEFAULT ((1)) NOT NULL
    , [isDeleted]       BIT              DEFAULT ((0)) NOT NULL
    , [createdDate]     DATETIME         NULL
    , [createdBy]       UNIQUEIDENTIFIER NULL
    , [updatedDate]     DATETIME         NULL
    , [updatedBy]       UNIQUEIDENTIFIER NULL
)
