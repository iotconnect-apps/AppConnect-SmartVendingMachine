/*******************************************************************
DECLARE @output INT = 0
		,@fieldName	nvarchar(255)
		,@syncDate	DATETIME
EXEC [dbo].[EntityStatistics_Get]
	 @guid				= '2D442AEA-E58B-4E8E-B09B-5602E1AA545A'	
	,@currentDate	= '2020-05-21 06:47:56.890'
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT
	,@syncDate		= @syncDate		OUTPUT
               
 SELECT @output status,  @fieldName AS fieldName, @syncDate syncDate    
 
001	SVM-4 11-05-2020 [Nishit Khakhi]	Added Initial Version to Get Company Statistics
*******************************************************************/

CREATE PROCEDURE [dbo].[EntityStatistics_Get]
(	 @guid				UNIQUEIDENTIFIER	
	,@currentDate		DATETIME			= NULL
	,@invokingUser		UNIQUEIDENTIFIER	= NULL
	,@version			NVARCHAR(10)
	,@output			SMALLINT		  OUTPUT
	,@fieldName			NVARCHAR(255)	  OUTPUT
	,@syncDate			DATETIME		  OUTPUT
	,@culture			NVARCHAR(10)	  = 'en-Us'
	,@enableDebugInfo	CHAR(1)			  = '0'
)
AS
BEGIN
    SET NOCOUNT ON
	IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'EntityStatistics_Get' AS '@procName'
			, CONVERT(nvarchar(MAX),@guid) AS '@guid'			
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
		SET @syncDate = (SELECT TOP 1 CONVERT(DATETIME,[value]) FROM dbo.[Configuration] (NOLOCK) WHERE [configKey] = 'telemetry-last-exectime')
		;WITH CTE_DeviceCount
		AS (	SELECT [entityGuid]
						, SUM(CASE WHEN [isProvisioned] = 1 THEN 1 ELSE 0 END) [connectedDeviceCount] 
						, SUM(CASE WHEN [isProvisioned] = 0 THEN 1 ELSE 0 END) [disconnectedDeviceCount] 
				FROM [dbo].[Device] (NOLOCK) 
				WHERE [entityGuid] = @guid AND [isDeleted] = 0
				GROUP BY [entityGuid]
		)
		,CTE_EnergyCount
		AS (	SELECT E.[entityGuid]
						, SUM([sum]) [energyCount]
				FROM [dbo].[TelemetrySummary_HourWise] T (NOLOCK) 
				INNER JOIN [dbo].[Device] E (NOLOCK) ON T.[deviceGuid] = E.[guid]
				WHERE E.[entityGuid] = @guid AND [attribute] = 'currentin'
					AND CONVERT(DATE,T.[date]) = CONVERT(DATE,@currentDate)
				GROUP BY E.[entityGuid]
		)
		,CTE_DeviceEnergyCount
		AS (	SELECT T.[deviceGuid]
						, SUM([sum]) [energyCount]
				FROM [dbo].[TelemetrySummary_HourWise] T (NOLOCK) 
				INNER JOIN [dbo].[Device] E (NOLOCK) ON T.[deviceGuid] = E.[guid]
				WHERE E.[entityGuid] = @guid AND [attribute] = 'currentin'
					AND CONVERT(DATE,T.[date]) = CONVERT(DATE,@currentDate)
				GROUP BY T.[deviceGuid]
		)
		SELECT [guid]
				, ISNULL(D.[connectedDeviceCount],0) + ISNULL(D.[disconnectedDeviceCount],0) AS [totalDevices]
				, ISNULL(D.[connectedDeviceCount],0) AS [totalConnected]
				, ISNULL(D.[disconnectedDeviceCount],0) AS [totalDisconnected]
				, ISNULL(E.[energyCount],0) AS [totalEnergyCount]
				, ISNULL(MinCount.[name],'') AS [minDeviceName]
				, ISNULL(MinCount.[minCount],0) AS [minDeviceCount]
				, ISNULL(MaxCount.[name],'') AS [maxDeviceName]
				, ISNULL(MaxCount.[maxCount],0) AS [maxDeviceCount]
		FROM [dbo].[Entity] C (NOLOCK) 
		LEFT JOIN CTE_DeviceCount D ON C.[guid] = D.[entityGuid]
		LEFT JOIN CTE_EnergyCount E ON C.[guid] = E.[entityGuid]
		LEFT JOIN 
			(SELECT	TOP	1 E.[entityGuid], 
				E.[name],
				MIN([energyCount]) as [minCount]
			 FROM CTE_DeviceEnergyCount CDE 
			 INNER JOIN [dbo].[Device] E (NOLOCK) ON CDE.[deviceGuid] = E.[guid] AND E.[isDeleted] = 0
			 GROUP BY E.[entityGuid],E.[name]
			 ORDER BY [minCount] ASC 
			) MinCount ON MinCount.[entityGuid] = C.[guid]
		LEFT JOIN 
			(SELECT	TOP	1 E.[entityGuid], 
				E.[name],
				MAX([energyCount]) as [maxCount]
			 FROM CTE_DeviceEnergyCount CDE 
			 INNER JOIN [dbo].[Device] E (NOLOCK) ON CDE.[deviceGuid] = E.[guid] AND E.[isDeleted] = 0
			 GROUP BY E.[entityGuid],E.[name]
			 ORDER BY [maxCount] DESC 
			) MaxCount ON MaxCount.[entityGuid] = C.[guid]
		WHERE C.[guid]=@guid AND C.[isDeleted]=0
		
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