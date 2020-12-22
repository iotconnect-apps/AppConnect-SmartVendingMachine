/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName				nvarchar(255)
EXEC [dbo].[Chart_InventoryStatus]
	@companyGuid		= '007D434D-1C8E-40B9-A2EA-A7263F02DC0E'	
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
               
 SELECT @output status,  @fieldName AS fieldName    
 
 001	SVM-4 25-05-2020 [Nishit Khakhi]	Added Initial Version to Get Inventory Available Qty
*******************************************************************/

CREATE PROCEDURE [dbo].[Chart_InventoryStatus]
(	 @companyGuid		UNIQUEIDENTIFIER
	,@invokingUser		UNIQUEIDENTIFIER
	,@version			NVARCHAR(10)
	,@output			SMALLINT		  OUTPUT
	,@fieldName			NVARCHAR(255)	  OUTPUT	
	,@culture			NVARCHAR(10)	  = 'en-Us'
	,@enableDebugInfo	CHAR(1)			  = '0'
)
AS
BEGIN
    SET NOCOUNT ON
	DECLARE @orderBy VARCHAR(10)
    IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'Chart_InventoryStatus' AS '@procName'
			, CONVERT(nvarchar(MAX),@companyGuid) AS '@companyGuid'
			, CONVERT(nvarchar(MAX),@invokingUser) AS '@invokingUser'
			, CONVERT(nvarchar(MAX),@version) AS '@version'
			, CONVERT(nvarchar(MAX),@output) AS '@output'
            , CONVERT(nvarchar(MAX),@fieldName) AS '@fieldName'
            FOR XML PATH('Params')
	    )
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END
    Set @output = 1
    SET @fieldName = 'Success'

     BEGIN TRY
		DECLARE @thresholdLimit DECIMAL(8,2)

		SELECT @thresholdLimit = CONVERT(DECIMAL(8,2),[value])
		FROM dbo.[Configuration] (NOLOCK) 
		WHERE [configKey] = 'threshold-limit' AND [isDeleted] = 0


		IF OBJECT_ID('tempdb..#devices') IS NOT NULL DROP TABLE #devices	
		CREATE TABLE #devices
		(	[guid]			 UNIQUEIDENTIFIER
		)

		INSERT INTO #devices
		SELECT [guid]
		FROM [dbo].[Device] (NOLOCK)
		WHERE [companyGuid] = @companyGuid
			AND [isDeleted] = 0

		;WITH CTE_Capacity
		AS (	SELECT D.[guid], SUM(DI.[capacity]) AS [totalCapacity]
				FROM #devices D 
				INNER JOIN [dbo].[Inventory] I (NOLOCK) ON D.[guid] = I.[deviceGuid] AND I.[isDeleted] = 0
				LEFT JOIN [dbo].[DeviceItem] DI (NOLOCK) ON I.[deviceItemGuid] = DI.[guid] AND DI.[isDeleted] = 0
				GROUP BY D.[guid]
		)
		, CTE_AvailableQuantity
		AS (	SELECT D.[guid], SUM(DI.[qty]) AS [totalAvailableQty]
				FROM #devices D
				LEFT JOIN [dbo].[TelemetrySummary_DeviceItemConsumption] DI (NOLOCK) ON D.[guid] = DI.[deviceGuid]
				WHERE CONVERT(DATE,DI.[date]) = CONVERT(DATE,GETUTCDATE())
				GROUP BY D.[guid]
		)
		SELECT D.[name] AS [deviceName]
			, D.[uniqueId] AS [uniqueId]
			, ISNULL(A.[totalAvailableQty],0) [totalAvailableQty]
			, CASE WHEN A.[totalAvailableQty] > 0 AND ROUND(((A.[totalAvailableQty] * 100) / C.[totalCapacity]),2) < @thresholdLimit 
					THEN 'Red' ELSE 'Green' END AS [color]
		FROM [dbo].[Device] D (NOLOCK)
		LEFT JOIN CTE_Capacity C ON D.[guid] = C.[guid]
		LEFT JOIN CTE_AvailableQuantity A ON D.[guid] = A.[guid]
		WHERE D.[companyGuid] = @companyGuid
			AND D.[isDeleted]=0
		ORDER BY [totalAvailableQty] DESC

	END TRY
	BEGIN CATCH
		DECLARE @errorReturnMessage nvarchar(MAX)

		SET @output = 0

		SELECT @errorReturnMessage =
			ISNULL(@errorReturnMessage, '') +  SPACE(1)   +
			'ErrorNumber:'  + ISNULL(CAST(ERROR_NUMBER() as nvarchar), '')  +
			'ErrorSeverity:'  + ISNULL(CAST(ERROR_SEVERITY() as nvarchar), '') +
			'ErrorState:'  + ISNULL(CAST(ERROR_STATE() as nvarchar), '') +
			'ErrorLine:'  + ISNULL(CAST(ERROR_LINE () as nvarchar), '') +
			'ErrorProcedure:'  + ISNULL(CAST(ERROR_PROCEDURE() as nvarchar), '') +
			'ErrorMessage:'  + ISNULL(CAST(ERROR_MESSAGE() as nvarchar(max)), '')
		RAISERROR (@errorReturnMessage, 11, 1)

		IF (XACT_STATE()) = -1
		BEGIN
			ROLLBACK TRANSACTION
		END
		IF (XACT_STATE()) = 1
		BEGIN
			ROLLBACK TRANSACTION
		END
		RAISERROR (@errorReturnMessage, 11, 1)
	END CATCH
END