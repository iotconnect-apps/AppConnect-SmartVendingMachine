CREATE TABLE [dbo].[DeviceItemHistory]
(
	[guid]				UNIQUEIDENTIFIER NOT NULL PRIMARY KEY
	, [deviceItemGuid]	UNIQUEIDENTIFIER NOT NULL 
	, [operation]		NVARCHAR(20)	 NOT NULL
	, [refillQuantity]	BIGINT			 NOT NULL
	, [createdDate]     DATETIME         NULL
    , [createdBy]       UNIQUEIDENTIFIER NULL
	, [isDeleted]      BIT               DEFAULT ((0)) NOT NULL
)
