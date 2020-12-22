
/*******************************************************************
DECLARE 
     @output INT = 0
	,@fieldName				nvarchar(255)
EXEC [dbo].[DeviceItemHistory_List]		
	@deviceItemGuid		= '12A5CD86-F6C6-455F-B27A-EFE587ED410D'	
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
               
 SELECT @output status,  @fieldName AS fieldName    
 
 001	sgh-1 28-11-2019 [Nishit Khakhi]	Added Initial Version to Lookup Air Quality
*******************************************************************/

CREATE PROCEDURE [dbo].[DeviceItemHistory_List]
(	 @deviceItemGuid	UNIQUEIDENTIFIER
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
	
	IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'DeviceItemHistory_List' AS '@procName'			
			, CONVERT(nvarchar(MAX),@deviceItemGuid) AS '@deviceItemGuid'
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
		
		SELECT G.[name] As [entityName]
			, D.[name] AS [deviceName]
			, D.[uniqueId] AS [uniqueId]
			, DT.[uniqueId] AS [shelfId]
			, P.[name] AS [productName]
			, PT.[typeName] AS [productType]
			, [operation]
			, [refillQuantity]
			, I.[createdDate] AS [refillDate]
		FROM [dbo].[DeviceItemHistory] I (NOLOCK) 
		INNER JOIN [dbo].[DeviceItem] DT WITH (NOLOCK) ON I.[deviceItemGuid] = DT.[guid] AND DT.[isDeleted] = 0
		INNER JOIN [dbo].[device] D WITH (NOLOCK) ON DT.[deviceGuid] = D.[guid] AND D.[isDeleted] = 0
		LEFT JOIN [dbo].[Inventory] Inv WITH (NOLOCK) ON Inv.[deviceItemGuid] = DT.[guid] AND DT.[isDeleted] = 0
		LEFT JOIN [dbo].[Entity] G WITH (NOLOCK) ON D.[entityGuid] = G.[guid] AND G.[isDeleted] = 0
		LEFT JOIN [dbo].[Product] P WITH (NOLOCK) ON Inv.[productGuid] = P.[guid] AND P.[isDeleted] = 0
		LEFT JOIN [dbo].[ProductType] PT WITH (NOLOCK) ON P.[productTypeGuid] = PT.[guid] AND PT.[isDeleted] = 0
		WHERE DT.[guid] = @deviceItemGuid --AND I.[isDeleted] = 0
		ORDER BY I.[createdDate] DESC
		

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