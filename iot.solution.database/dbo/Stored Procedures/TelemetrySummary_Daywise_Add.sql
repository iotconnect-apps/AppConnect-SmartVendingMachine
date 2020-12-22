/*******************************************************************
EXEC [dbo].[TelemetrySummary_Daywise_Add]	
	
001	SAQM-1 08-04-2020 [Nishit Khakhi]	Added Initial Version to Add Telemetry Summary Day wise for Day
*******************************************************************/
CREATE PROCEDURE [dbo].[TelemetrySummary_Daywise_Add]
AS
BEGIN
	SET NOCOUNT ON
	
	BEGIN TRY
	DECLARE @dt DATETIME = GETUTCDATE(), @lastExecDate DATETIME
	SELECT 
		TOP 1 @lastExecDate = CONVERT(DATETIME,[value]) 
	FROM [dbo].[Configuration] 
	WHERE [configKey] = 'telemetry-last-exectime' AND [isDeleted] = 0

	BEGIN TRAN		
		DELETE FROM [dbo].[TelemetrySummary_Daywise] WHERE (CONVERT(DATE,[date]) BETWEEN CONVERT(DATE,@lastExecDate) AND CONVERT(DATE,@dt))  
		
		INSERT INTO [dbo].[TelemetrySummary_Daywise]([guid]
		,[deviceGuid]
		,[date]
		,[attribute]
		,[min]
		,[max]
		,[avg]
		,[latest]
		,[sum]
		)
		
		SELECT NEWID(), [guid], [Date], [localName], 0, 0, ValueCount, 0, 0
		FROM (
		
		select D.[guid],KA.[code] AS localName, CONVERT(DATE,A.createdDate) [Date], AVG(ROUND(CONVERT(DECIMAL(18,7),REPLACE(attributeValue,',','')),2)) ValueCount
		FROM [IOTConnect].[AttributeValue] A (NOLOCK)
		INNER JOIN [dbo].[Device] D (NOLOCK) ON A.[uniqueId] = D.[uniqueId] AND D.[isDeleted] = 0
		INNER JOIN [dbo].[KitTypeAttribute] KA ON A.[localName] = KA.[localName] --AND D.[tag] = KA.[tag]
		WHERE (CONVERT(DATE,A.[createdDate]) BETWEEN CONVERT(DATE,@lastExecDate) AND CONVERT(DATE,@dt)) AND KA.[code] IN ('voltage','temp','humidity','vibration')
		GROUP BY D.[guid],KA.[code] , CONVERT(DATE,A.createdDate)
		) A
		
		INSERT INTO [dbo].[TelemetrySummary_Daywise]([guid]
		,[deviceGuid]
		,[date]
		,[attribute]
		,[min]
		,[max]
		,[avg]
		,[latest]
		,[sum]
		)
		
		SELECT NEWID(), [guid], [Date], [localName], 0, 0, 0, 0, ValueCount
		FROM (
		
		select D.[guid],KA.[code] AS [localName], CONVERT(DATE,A.createdDate) [DATE], SUM(CONVERT(DECIMAL(18,2),REPLACE(attributeValue,',',''))) ValueCount
		FROM [IOTConnect].[AttributeValue] A (NOLOCK)
		INNER JOIN [dbo].[Device] D (NOLOCK) ON A.[uniqueId] = D.[uniqueId] AND D.[isDeleted] = 0
		INNER JOIN [dbo].[KitTypeAttribute] KA ON A.[localName] = KA.[localName] --AND D.[tag] = KA.[tag]
		WHERE (CONVERT(DATE,A.[createdDate]) BETWEEN CONVERT(DATE,@lastExecDate) AND CONVERT(DATE,@dt)) AND KA.[code] IN ('currentin','t1','t2','t3')
		GROUP BY D.[guid],KA.[code], CONVERT(DATE,A.createdDate)
		) A

		;WITH CTE_Attribute 
		AS (	SELECT [uniqueId], [localName], [createdDate], [attributeValue], ROW_NUMBER() OVER (PARTITION BY [uniqueId],[localName] ORDER BY [createdDate] DESC) AS [no] 
				FROM [IOTConnect].[AttributeValue] A
				WHERE [localName] = 'doorstatus'
					AND (CONVERT(DATE,A.[createdDate]) BETWEEN CONVERT(DATE,@lastExecDate) AND CONVERT(DATE,@dt))
		)		
		INSERT INTO [dbo].[TelemetrySummary_Hourwise]([guid]
		,[deviceGuid]
		,[date]
		,[attribute]
		,[min]
		,[max]
		,[avg]
		,[latest]
		,[sum]
		)
		
		SELECT NEWID(), [guid], [DATE], [localName], 0, 0, 0, ValueCount, 0
		FROM (
		SELECT D.[guid],KA.[code] AS localName, CONVERT(DATE,A.createdDate) [Date], CONVERT(DECIMAL(18,2),REPLACE(attributeValue,',','')) ValueCount
		FROM (SELECT * FROM CTE_Attribute) A
		INNER JOIN [dbo].[KitTypeAttribute] KA ON A.[localName] = KA.[localName]
		INNER JOIN [dbo].[Device] D ON A.[uniqueId] = D.[uniqueId] AND D.[isDeleted] = 0
		WHERE (CONVERT(DATE,A.[createdDate]) BETWEEN CONVERT(DATE,@lastExecDate) AND CONVERT(DATE,@dt)) AND KA.[code] IN ('doorstatus')
		--GROUP BY D.[guid],KA.[code], CONVERT(DATE,A.createdDate)
		) A

		UPDATE C 
		SET [value] = convert(nvarchar(50),@dt,121)
		FROM [dbo].[Configuration] C 
		WHERE [configKey] = 'telemetry-last-exectime' AND [isDeleted] = 0

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