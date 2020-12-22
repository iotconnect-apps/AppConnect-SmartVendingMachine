/*******************************************************************
DECLARE @count INT
     	,@output INT = 0
		,@fieldName	VARCHAR(255)

EXEC [dbo].[Inventory_List]
	 @companyGuid	= 'F29BE816-76B7-4E90-A9BC-20BE896A8C81'
	,@entityGuid    = '205837F2-E30B-4C3B-A617-8C28F704AC38'
	,@deviceGuid	= '907294A3-7FE0-4516-BB4B-A09CE83DC085'
	,@productGuid    = '29217D14-8E03-470C-849F-201520A0F07E'
	,@productTypeGuid  = '29217D14-8E03-470C-849F-201520A0F07E'
	,@pageSize		= 10
	,@pageNumber	= 1
	,@orderby		= NULL
	,@count			= @count OUTPUT
	,@invokingUser  = 'C1596B8C-7065-4D63-BFD0-4B835B93DFF2'
	,@version		= 'v1'
	,@output		= @output	OUTPUT
	,@fieldName		= @fieldName	OUTPUT

SELECT @count count, @output status, @fieldName fieldName

001	SVM-4 15-05-2020 [Nishit Khakhi]	Added Initial Version to get List of Product Files
002 SVM-4 17-06-2020 [Nishit Khakhi]	Updated to return availableQty in response
*******************************************************************/
CREATE PROCEDURE [dbo].[Inventory_List]
(	@companyGuid		UNIQUEIDENTIFIER
	,@entityGuid		UNIQUEIDENTIFIER	= NULL
	,@deviceGuid		UNIQUEIDENTIFIER	= NULL
	,@productGuid		UNIQUEIDENTIFIER	= NULL
	,@productTypeGuid	UNIQUEIDENTIFIER	= NULL
	,@search			VARCHAR(100)		= NULL
	,@pageSize			INT
	,@pageNumber		INT
	,@orderby			VARCHAR(100)		= NULL
	,@invokingUser		UNIQUEIDENTIFIER
	,@version			VARCHAR(10)
	,@culture			VARCHAR(10)			= 'en-Us'
	,@output			SMALLINT			OUTPUT
	,@fieldName			VARCHAR(255)		OUTPUT
	,@count				INT OUTPUT
	,@enableDebugInfo		CHAR(1)			= '0'
)
AS
BEGIN
    SET NOCOUNT ON

    IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'Inventory_List' AS '@procName'
            	, CONVERT(VARCHAR(50),@companyGuid) AS '@companyGuid'
				, CONVERT(VARCHAR(50),@entityGuid) AS '@entityGuid'
				, CONVERT(VARCHAR(50),@deviceGuid) AS '@deviceGuid'
				, CONVERT(VARCHAR(50),@productGuid) AS '@productGuid'
				, CONVERT(VARCHAR(50),@productTypeGuid) AS '@productTypeGuid'
            	, CONVERT(VARCHAR(MAX),@search) AS '@search'
				, CONVERT(VARCHAR(MAX),@pageSize) AS '@pageSize'
				, CONVERT(VARCHAR(MAX),@pageNumber) AS '@pageNumber'
				, CONVERT(VARCHAR(MAX),@orderby) AS '@orderby'
				, CONVERT(VARCHAR(MAX),@version) AS '@version'
            	, CONVERT(VARCHAR(MAX),@invokingUser) AS '@invokingUser'
            FOR XML PATH('Params')
	    )
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(VARCHAR(MAX), @Param), GETDATE())
    END
    
    BEGIN TRY

		SELECT @output = 1
			  ,@count = -1

		IF OBJECT_ID('tempdb..#Inventory') IS NOT NULL DROP TABLE #Inventory

		CREATE TABLE #Inventory
		(	[guid]				UNIQUEIDENTIFIER
			,[companyName]		NVARCHAR(100)
			,[entityName]		NVARCHAR(500)
			,[deviceGuid]		UNIQUEIDENTIFIER
			,[deviceName]		NVARCHAR(500)
			,[productName]		NVARCHAR(500)
			,[productType]		NVARCHAR(200)
			,[deviceItemGuid]	UNIQUEIDENTIFIER
			,[shelfId]			NVARCHAR(200)	
			,[refillDateTime]	DATETIME
			,[quantity]			BIGINT
			,[availableQty]		BIGINT
			,[rowNum]			INT
		)

		IF LEN(ISNULL(@orderby, '')) = 0
		SET @orderby = 'productName asc'

		DECLARE @Sql nvarchar(MAX) = ''

		SET @Sql = '
		SELECT
			*
			,ROW_NUMBER() OVER (ORDER BY '+@orderby+') AS rowNum
		FROM
		( SELECT
				I.[guid]
				, C.[name] AS [companyName]
				, G.[name] AS [entityName]
				, D.[guid] AS [deviceGuid]
				, D.[name] AS [deviceName]
				, P.[name] AS [productName]
				, PT.[typeName] AS [productType]
				, DT.[guid] AS [deviceItemGuid]
				, DT.[uniqueId] AS [shelfId]
				, I.[refillDateTime]
				, I.[quantity]
				, DT.[availableQty]
			FROM [dbo].[Inventory] I WITH (NOLOCK)
			INNER JOIN [dbo].[Company] C WITH (NOLOCK) ON I.[companyGuid] = C.[guid]
			LEFT JOIN [dbo].[device] D WITH (NOLOCK) ON I.[deviceGuid] = D.[guid] AND D.[isDeleted] = 0
			LEFT JOIN [dbo].[Entity] G WITH (NOLOCK) ON I.[entityGuid] = G.[guid] AND G.[isDeleted] = 0
			LEFT JOIN [dbo].[Product] P WITH (NOLOCK) ON I.[productGuid] = P.[guid] AND P.[isDeleted] = 0
			LEFT JOIN [dbo].[ProductType] PT WITH (NOLOCK) ON P.[productTypeGuid] = PT.[guid] AND PT.[isDeleted] = 0
			LEFT JOIN [dbo].[DeviceItem] DT WITH (NOLOCK) ON I.[deviceItemGuid] = DT.[guid] AND DT.[isDeleted] = 0
			WHERE I.[companyGuid] = @companyGuid AND I.[isDeleted]=0 '
			+ CASE WHEN @entityGuid IS NULL THEN '' ELSE ' AND G.[guid] = @entityGuid ' END +
			+ CASE WHEN @deviceGuid IS NULL THEN '' ELSE ' AND D.[guid] = @deviceGuid ' END +
			+ CASE WHEN @productGuid IS NULL THEN '' ELSE ' AND P.[guid] = @productGuid ' END +
			+ CASE WHEN @productTypeGuid IS NULL THEN '' ELSE ' AND PT.[guid] = @productTypeGuid ' END +
			+ CASE WHEN @search IS NULL THEN '' ELSE
			' AND (P.[name] LIKE ''%' + @search + '%''
				OR PT.[typeName] LIKE ''%' + @search + '%'' 
				OR G.[name] LIKE ''%' + @search + '%'' 
				OR D.[name] LIKE ''%' + @search + '%'' )'
			 END +
		' )  data '
		
		INSERT INTO #Inventory
		EXEC sp_executesql 
			  @Sql
			, N'@orderby VARCHAR(100), @companyGuid UNIQUEIDENTIFIER, @entityGuid UNIQUEIDENTIFIER, @deviceGuid UNIQUEIDENTIFIER , @productGuid UNIQUEIDENTIFIER, @productTypeGuid UNIQUEIDENTIFIER '
			, @orderby		= @orderby			
			, @companyGuid = @companyGuid
			, @entityGuid = @entityGuid
			, @deviceGuid = @deviceGuid
			, @productGuid = @productGuid
			, @productTypeGuid = @productTypeGuid
		SET @count = @@ROWCOUNT

		IF(@pageSize <> -1 AND @pageNumber <> -1)
			BEGIN
				SELECT 
					[guid]				
					,[companyName]		
					,[entityName]	
					,[deviceGuid]
					,[deviceName]		
					,[productName]		
					,[productType]
					,[deviceItemGuid]
					,[shelfId]
					,[refillDateTime]	
					,[quantity]		
					,[availableQty]			
				FROM #Inventory 
				WHERE rowNum BETWEEN ((@pageNumber - 1) * @pageSize) + 1 AND (@pageSize * @pageNumber)			
			END
		ELSE
			BEGIN
				SELECT 
					[guid]				
					,[companyName]		
					,[entityName]
					,[deviceGuid]
					,[deviceName]		
					,[productName]		
					,[productType]	
					,[deviceItemGuid]
					,[shelfId]
					,[refillDateTime]	
					,[quantity]		
					,[availableQty]			
				FROM #Inventory 
			END
	   
        SET @output = 1
		SET @fieldName = 'Success'
	END TRY	
	BEGIN CATCH	
		DECLARE @errorReturnMessage VARCHAR(MAX)

		SET @output = 0

		SELECT @errorReturnMessage = 
			ISNULL(@errorReturnMessage, '') +  SPACE(1)   + 
			'ErrorNumber:'  + ISNULL(CAST(ERROR_NUMBER() as VARCHAR), '')  + 
			'ErrorSeverity:'  + ISNULL(CAST(ERROR_SEVERITY() as VARCHAR), '') + 
			'ErrorState:'  + ISNULL(CAST(ERROR_STATE() as VARCHAR), '') + 
			'ErrorLine:'  + ISNULL(CAST(ERROR_LINE () as VARCHAR), '') + 
			'ErrorProcedure:'  + ISNULL(CAST(ERROR_PROCEDURE() as VARCHAR), '') + 
			'ErrorMessage:'  + ISNULL(CAST(ERROR_MESSAGE() as VARCHAR(max)), '')
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