/*******************************************************************

EXEC [dbo].[TelemetrySummary_DeviceItemConsumption_Add]	
	
001	SVM-4 26-05-2020 [Nishit Khakhi]	Added Initial Version to Add Telemetry Summary of Device Item Consumption
*******************************************************************/
CREATE PROCEDURE [dbo].[TelemetrySummary_DeviceItemConsumption_Add]
AS
BEGIN
	SET NOCOUNT ON
	
	BEGIN TRY
	DECLARE @dt DATETIME = GETUTCDATE(), @lastExecDate DATETIME
	SELECT 
		TOP 1 @lastExecDate = CONVERT(DATETIME,[value]) 
	FROM [dbo].[Configuration] 
	WHERE [configKey] = 'shelfConsuption-last-updatetime' AND [isDeleted] = 0

	IF OBJECT_ID('tempdb..#DeviceItemData') IS NOT NULL DROP TABLE #DeviceItemData

	BEGIN TRAN		
		
		SELECT NEWID() AS [guid], [deviceGuid], @dt AS [date], [localName], [valueCount] 
		INTO #DeviceItemData
		FROM (
		select D.[guid] AS [deviceGuid],KA.[code] AS localName, SUM(ROUND(CONVERT(DECIMAL(18,7),REPLACE(attributeValue,',','')),0)) ValueCount
		FROM [IOTConnect].[AttributeValue] A (NOLOCK)
		INNER JOIN [dbo].[Device] D (NOLOCK) ON A.[uniqueId] = D.[uniqueId] AND D.[isDeleted] = 0
		INNER JOIN [dbo].[KitTypeAttribute] KA ON A.[localName] = KA.[localName] --AND D.[tag] = KA.[tag]
		WHERE (CONVERT(DATETIME,A.[createdDate]) BETWEEN CONVERT(DATETIME,@lastExecDate) AND CONVERT(DATETIME,@dt)) AND KA.[code] IN ('T1','T2','T3')
		GROUP BY D.[guid],KA.[code]
		) A
		
		INSERT INTO [dbo].[TelemetrySummary_DeviceItemConsumption]([guid]
		,[deviceGuid]
		,[date]
		,[attribute]
		,[qty]
		)
		SELECT * FROM #DeviceItemData

		UPDATE DI
		SET [availableQty] = CASE WHEN DI.[capacity] < ISNULL(DI.[availableQty],0) - ISNULL(D.[ValueCount],0) 
							THEN ISNULL(DI.[availableQty],0)
							ELSE ISNULL(DI.[availableQty],0) - ISNULL(D.[ValueCount],0)
							END
		FROM dbo.[DeviceItem] DI
		INNER JOIN #DeviceItemData D ON DI.[deviceGuid] = D.[deviceGuid] AND DI.[sequence] = D.[localName]
		WHERE DI.[isDeleted] = 0
		
		UPDATE C 
		SET [value] = convert(nvarchar(50),@dt,121)
		FROM [dbo].[Configuration] C 
		WHERE [configKey] = 'shelfConsuption-last-updatetime' AND [isDeleted] = 0
		
	COMMIT TRAN	

	END TRY	
	BEGIN CATCH
	DECLARE @errorReturnMessage nvarchar(MAX)

	SELECT
		@errorReturnMessage = ISNULL(@errorReturnMessage, ' ') + SPACE(1) +
		'ErrorNumber:' + ISNULL(CAST(ERROR_NUMBER() AS nvarchar), ' ') +
		'ErrorSeverity:' + ISNULL(CAST(ERROR_SEVERITY() AS nvarchar), ' ') +
		'ErrorState:' + ISNULL(CAST(ERROR_STATE() AS nvarchar), ' ') +
		'ErrorLine:' + ISNULL(CAST(ERROR_LINE() AS nvarchar), ' ') +
		'ErrorProcedure:' + ISNULL(CAST(ERROR_PROCEDURE() AS nvarchar), ' ') +
		'ErrorMessage:' + ISNULL(CAST(ERROR_MESSAGE() AS nvarchar(MAX)), ' ')

	RAISERROR (@errorReturnMessage
	, 11
	, 1
	)

	IF (XACT_STATE()) = -1 BEGIN
		ROLLBACK TRANSACTION
	END
	IF (XACT_STATE()) = 1 BEGIN
		ROLLBACK TRANSACTION
	END
	END CATCH
END

