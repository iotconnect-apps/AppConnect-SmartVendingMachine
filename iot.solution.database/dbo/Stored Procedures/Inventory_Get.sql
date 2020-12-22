/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName				nvarchar(255)
EXEC [dbo].[Inventory_Get]
	 @guid				= '785D916C-F4D4-4651-AC5F-2F3F8F4E8CFE'	
	,@companyGuid		= '007D434D-1C8E-40B9-A2EA-A7263F02DC0E'
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
               
 SELECT @output status,  @fieldName AS fieldName    
 
 001	SVM-4 26-05-2020 [Nishit Khakhi]	Added Initial Version to Get Inventory Information
*******************************************************************/
CREATE PROCEDURE [dbo].[Inventory_Get]
(	 @guid				UNIQUEIDENTIFIER	
	,@companyGuid		UNIQUEIDENTIFIER
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
            SELECT 'Inventory_Get' AS '@procName'
			, CONVERT(nvarchar(MAX),@guid) AS '@guid'			
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

    IF NOT EXISTS (SELECT TOP 1 1 FROM [dbo].[Inventory] (NOLOCK) WHERE [companyGuid]=@companyGuid AND [guid]=@guid AND [isDeleted]=0)
	BEGIN
		Set @output = -3
		SET @fieldName = 'InventoryNotFound'
		RETURN;
	END
  
    BEGIN TRY
		SELECT I.[guid]
			, I.[companyGuid]
			, G.[guid] AS [entityGuid]
			, G.[name] AS [entityName]
			, D.[guid] AS [deviceGuid]
			, D.[name] AS [deviceName]
			, P.[guid] AS [productGuid]
			, P.[name] AS [productName]
			, PT.[guid] AS [productTypeGuid]
			, PT.[typeName] AS [ProductType]
			, DT.[guid] AS [deviceItemGuid]
			, DT.[uniqueId] AS [shelfId]
			, I.[refillDateTime]
			, DT.[capacity]
			, DT.[availableQty]	 
		FROM [dbo].[Inventory] I (NOLOCK)
		INNER JOIN [dbo].[device] D WITH (NOLOCK) ON I.[deviceGuid] = D.[guid] AND D.[isDeleted] = 0
		INNER JOIN [dbo].[Entity] G WITH (NOLOCK) ON I.[entityGuid] = G.[guid] AND G.[isDeleted] = 0
		INNER JOIN [dbo].[Product] P WITH (NOLOCK) ON I.[productGuid] = P.[guid] AND P.[isDeleted] = 0
		INNER JOIN [dbo].[ProductType] PT WITH (NOLOCK) ON P.[productTypeGuid] = PT.[guid] AND PT.[isDeleted] = 0
		INNER JOIN [dbo].[DeviceItem] DT WITH (NOLOCK) ON I.[deviceItemGuid] = DT.[guid] AND DT.[isDeleted] = 0
		WHERE I.[companyGuid]=@companyGuid AND I.[guid]=@guid AND I.[isDeleted]=0

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