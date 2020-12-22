/*******************************************************************
DECLARE @output INT = 0
	,@fieldName	nvarchar(255)
	,@newid UNIQUEIDENTIFIER

EXEC [dbo].[Product_AddUpdate]
	@companyGuid		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@productTypeGuid	= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@guid				= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@name				= 'Product 656 name'
	,@image				= '1.jpg'
	,@invokingUser		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT
	,@newid				= @newid		OUTPUT

SELECT @output status, @fieldName fieldname,@newid newid

001	SVM-4 14-05-2020 [Nishit Khakhi]	Added Initial Version to Add Update Product
*******************************************************************/

CREATE PROCEDURE [dbo].[Product_AddUpdate]
(	@companyGuid		UNIQUEIDENTIFIER
	,@productTypeGuid	UNIQUEIDENTIFIER	
	,@guid				UNIQUEIDENTIFIER	= NULL
	,@name	 			NVARCHAR(500)
	,@image				NVARCHAR(200)		= NULL
	,@invokingUser		UNIQUEIDENTIFIER
	,@version			NVARCHAR(10)
	,@output			SMALLINT			OUTPUT
	,@fieldName			NVARCHAR(100)		OUTPUT
	,@newid				UNIQUEIDENTIFIER   	OUTPUT
	,@culture			NVARCHAR(10)		= 'en-Us'
	,@enableDebugInfo	 CHAR(1)			= '0'
)
AS
BEGIN
	SET NOCOUNT ON
	DECLARE @dt DATETIME = GETUTCDATE()
    IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'Product_AddUpdate' AS '@procName'
				, CONVERT(nvarchar(MAX),@companyGuid) AS '@companyGuid'
				, CONVERT(nvarchar(MAX),@productTypeGuid) AS '@productTypeGuid'
				, CONVERT(nvarchar(MAX),@guid) AS '@guid'
				, @name AS '@name'
				, @image AS '@image'
				 , CONVERT(nvarchar(MAX),@invokingUser) AS '@invokingUser'
				, CONVERT(nvarchar(MAX),@version) AS '@version'
				, CONVERT(nvarchar(MAX),@output) AS '@output'
				, CONVERT(nvarchar(MAX),@fieldName) AS '@fieldName'
            FOR XML PATH('Params')
	    )
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), @dt)
    END

	SET @output = 1
	SET @fieldName = 'Success'
	
	BEGIN TRY
		
		SET @newid = NEWID()
		
		BEGIN TRAN
			IF @guid IS NULL AND NOT EXISTS(SELECT TOP 1 1 FROM [dbo].[Product] (NOLOCK) where companyGuid = @companyGuid AND [name] = @name AND isdeleted = 0)
			BEGIN	
				INSERT INTO [dbo].[Product]
			           ([guid]
			           ,[companyGuid]
					   ,[producttypeGuid]
			           ,[name]
					   ,[image]
					   ,[isActive]
					   ,[isDeleted]
			           ,[createdDate]
			           ,[createdBy]
			           ,[updatedDate]
			           ,[updatedBy]
						)
			     VALUES
			           (@newid
			           ,@companyGuid
			           ,@productTypeGuid
			           ,@name
					   ,@image
					   ,1
			           ,0
			           ,@dt
			           ,@invokingUser				   
					   ,@dt
					   ,@invokingUser				   
				       );
			END
			ELSE
			BEGIN
				UPDATE [dbo].[Product]
				SET [productTypeGuid] = @productTypeGuid
					,[name] = @name
					,[image] = ISNULL(@image,[image])
					,[updatedDate] = @dt
					,[updatedBy] = @invokingUser
				WHERE [companyGuid] = @companyGuid AND ([guid] = @guid OR [name] = @name) AND [isDeleted] = 0
			END
		
		COMMIT TRAN

	END TRY

	BEGIN CATCH

	SET @output = 0
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