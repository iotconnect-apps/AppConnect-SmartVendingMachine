/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName				nvarchar(255)
EXEC [dbo].[Inventory_ConsupmtionByProduct]
	@companyGuid		= '007D434D-1C8E-40B9-A2EA-A7263F02DC0E'	
	,@currentDate		= '2020-05-21 06:47:56.890'
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
               
 SELECT @output status,  @fieldName AS fieldName    
 
 001	SVM-4 22-05-2020 [Nishit Khakhi]	Added Initial Version to Get Inventory Consumption by Product
*******************************************************************/

CREATE PROCEDURE [dbo].[Inventory_ConsupmtionByProduct]
(	 @companyGuid		UNIQUEIDENTIFIER
	,@entityGuid		UNIQUEIDENTIFIER	= NULL
	,@deviceGuid		UNIQUEIDENTIFIER	= NULL
	,@currentDate		DATETIME			= NULL
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
            SELECT 'Inventory_ConsupmtionByProduct' AS '@procName'
			, CONVERT(nvarchar(MAX),@companyGuid) AS '@companyGuid'
			, CONVERT(nvarchar(MAX),@entityGuid) AS '@entityGuid'
			, CONVERT(nvarchar(MAX),@deviceGuid) AS '@deviceGuid'
			, CONVERT(VARCHAR(50),@currentDate) as '@currentDate'
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
		WHERE [companyGuid] = ISNULL(@companyGuid,[companyGuid])
			AND [entityGuid] = ISNULL(@entityGuid,[entityGuid])
			AND [guid] = ISNULL(@deviceGuid,[guid])
			AND [isDeleted] = 0

		;WITH CTE_Capacity
		AS (	SELECT I.[productGuid], SUM(DI.[capacity]) AS [totalCapacity]
				FROM [dbo].[Device] D (NOLOCK)
				INNER JOIN #devices E ON D.[guid] = E.[guid]
				INNER JOIN [dbo].[Inventory] I (NOLOCK) ON D.[guid] = I.[deviceGuid] AND I.[isDeleted] = 0
				LEFT JOIN [dbo].[DeviceItem] DI (NOLOCK) ON I.[deviceItemGuid] = DI.[guid] AND DI.[isDeleted] = 0
				WHERE D.[isDeleted] = 0
				GROUP BY I.[productGuid]
		)
		, CTE_AvailableQuantity
		AS (	SELECT I.[productGuid], SUM(DC.[qty]) AS [totalAvailableQty],
				(ISNULL((select totalCapacity from CTE_Capacity C where I.[productGuid] = C.[productGuid]),0) - SUM(DC.[qty])) AS [totalRemainingQty] 
				FROM [dbo].[Device] D (NOLOCK)
				INNER JOIN #devices E ON D.[guid] = E.[guid]
				INNER JOIN [dbo].[Inventory] I (NOLOCK) ON D.[guid] = I.[deviceGuid] AND I.[isDeleted] = 0
				LEFT JOIN [dbo].[DeviceItem] DI (NOLOCK) ON I.[deviceItemGuid] = DI.[guid] AND DI.[isDeleted] = 0
				LEFT JOIN [dbo].[TelemetrySummary_DeviceItemConsumption] DC (NOLOCK) ON D.[guid] = DC.[deviceGuid] AND DI.[sequence] = DC.[attribute] AND CONVERT(DATE,DC.[date]) = CONVERT(DATE,@currentDate)
				WHERE D.[isDeleted] = 0
				GROUP BY I.[productGuid]
		)

		SELECT TOP 5 P.[name] AS [productName]
			, P.[image] AS [productImage]
			, ISNULL(C.[totalCapacity],0) [totalCapacity]
			, ISNULL(A.[totalAvailableQty],0) [totalAvailableQty]		
			, ISNULL(A.[totalRemainingQty],0) [totalRemainingQty]
			, ROUND(((A.[totalRemainingQty] * 100) / C.[totalCapacity]),2)  as [totalPercentage]
			, CASE WHEN A.[totalRemainingQty] > 0 AND ROUND(((A.[totalRemainingQty] * 100) / C.[totalCapacity]),2) < @thresholdLimit 
					THEN 'Red' ELSE 'Green' END AS [color]
		FROM [dbo].[Product] P (NOLOCK)
		Inner JOIN CTE_Capacity C ON P.[guid] = C.[productGuid]
		LEFT JOIN CTE_AvailableQuantity A ON P.[guid] = A.[productGuid]
		WHERE P.[companyGuid] = @companyGuid AND P.[isDeleted]=0 
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