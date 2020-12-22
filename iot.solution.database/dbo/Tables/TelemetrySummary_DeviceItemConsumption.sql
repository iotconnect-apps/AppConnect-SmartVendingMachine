CREATE TABLE [dbo].[TelemetrySummary_DeviceItemConsumption]
(	[guid]       UNIQUEIDENTIFIER NOT NULL,
    [deviceGuid] UNIQUEIDENTIFIER NOT NULL,
    [date]       DATETIME         NOT NULL,
    [attribute]  NVARCHAR (1000)  NULL,
    [qty]        BIGINT			  NULL,
	PRIMARY KEY CLUSTERED ([guid] ASC)
)
