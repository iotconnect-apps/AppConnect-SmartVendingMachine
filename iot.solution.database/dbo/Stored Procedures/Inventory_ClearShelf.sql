/*******************************************************************
DECLARE @output INT = 0
	,@fieldName	nvarchar(255)
	
EXEC [dbo].[Inventory_ClearShelf]
	@companyGuid		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@deviceItemGuid	= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@inventoryGuid		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@invokingUser		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT

SELECT @output status, @fieldName fieldname

001	SVM-4 26-05-2020 [Nishit Khakhi]	Added Initial Version to Add Clear Inventory
*******************************************************************/
CREATE PROCEDURE [dbo].[Inventory_ClearShelf]
(	@companyGuid		UNIQUEIDENTIFIER
	,@deviceItemGuid	UNIQUEIDENTIFIER
	,@inventoryGuid		UNIQUEIDENTIFIER
	,@invokingUser		UNIQUEIDENTIFIER
	,@version			NVARCHAR(10)
	,@output			SMALLINT			OUTPUT
	,@fieldName			NVARCHAR(100)		OUTPUT
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
            SELECT 'Inventory_ClearShelf' AS '@procName'
				, CONVERT(nvarchar(50),@companyGuid) AS '@companyGuid'
				, CONVERT(nvarchar(50),@deviceItemGuid) AS '@deviceItemGuid'
				, CONVERT(nvarchar(50),@inventoryGuid) AS '@inventoryGuid'
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
		IF NOT EXISTS (SELECT TOP 1 1 FROM [Inventory] (NOLOCK) WHERE companyGuid = @companyGuid
									AND [guid] = @inventoryGuid
									AND [deviceItemGuid] = @deviceItemGuid
									AND isdeleted = 0)
		BEGIN
			SET @output = -3
			SET @fieldname = 'InventoryNotExists'		 
			RETURN;
		END
		
		BEGIN TRAN
					UPDATE dbo.[DeviceItemHistory]
					SET [isDeleted] = 1
					WHERE [deviceItemGuid] = @deviceItemGuid AND [isDeleted] = 0
					
					INSERT INTO [dbo].[DeviceItemHistory]
									   ([guid]
									   ,[deviceItemGuid]
									   ,[operation]
									   ,[refillQuantity]
									   ,[createdDate]
									   ,[createdBy]
									   ,[isDeleted]
									   )
								 SELECT TOP 1 
										newid()
									   ,@deviceItemGuid
									   ,'Substract' 
									   ,ISNULL([availableQty],0) 
									   ,@dt
									   ,@invokingUser
									   ,1 
									FROM [dbo].[DeviceItem]	
								WHERE [guid] = @deviceItemGuid AND [isDeleted] = 0 
								ORDER BY createdDate DESC

					UPDATE dbo.[DeviceItem]
					SET [availableQty] = 0
						, [updatedBy] = @invokingUser
						, [updatedDate] = @dt
					WHERE [guid] = @deviceItemGuid AND [isDeleted] = 0

					UPDATE dbo.[Inventory]
					SET [quantity] = 0
						, [updatedBy] = @invokingUser
						, [updatedDate] = @dt
					WHERE [guid] = @inventoryGuid AND [deviceItemGuid] = @deviceItemGuid AND [isDeleted] = 0
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