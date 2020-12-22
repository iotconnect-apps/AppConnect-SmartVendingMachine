/*******************************************************************
DECLARE @output INT = 0
	,@fieldName	nvarchar(255)
	
EXEC [dbo].[Inventory_Update]
	@guid				= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@deviceItemGuid	= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@action			= 'add'
	,@qty				= 1500
	,@invokingUser		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT
	
SELECT @output status, @fieldName fieldname

001	SVM-4 14-05-2020 [Nishit Khakhi]	Added Initial Version to Add Update Inventory
002 SVM-4 18-06-2020 [Nishit Khakhi]	Updated to remove validation, as it will handle from UI
*******************************************************************/
CREATE PROCEDURE [dbo].[Inventory_Update]
(	@guid				UNIQUEIDENTIFIER
	,@deviceItemGuid	UNIQUEIDENTIFIER
	,@action			NVARCHAR(20)
	,@qty	 			BIGINT
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
            SELECT 'Inventory_Update' AS '@procName'
				, CONVERT(nvarchar(50),@guid) AS '@guid'
				, CONVERT(nvarchar(50),@deviceItemGuid) AS '@deviceItemGuid'
				, @action AS '@action'
				, CONVERT(nvarchar(15),@qty) AS '@qty'
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
		IF NOT EXISTS (SELECT TOP 1 1 FROM [Inventory] (NOLOCK) WHERE [guid] = @guid
									AND isdeleted = 0)
			BEGIN
				SET @output = -3
				SET @fieldname = 'InventoryNotFound'		 
				RETURN;
			END
			--IF EXISTS (SELECT TOP 1 1 FROM [DeviceItem] (NOLOCK) WHERE [guid] = @deviceItemGuid
			--						AND [capacity] < [availableQty] + @qty
			--						AND isdeleted = 0)
			--BEGIN
			--	SET @output = -3
			--	SET @fieldname = 'RefillQuantityMustBeLessThanCapacity'		 
			--	RETURN;
			--END
		BEGIN TRAN
				UPDATE [dbo].[DeviceItem]
				SET [availableQty] = CASE WHEN @action = 'Add' THEN ISNULL([availableQty],0) + ISNULL(@qty,0)
								 ELSE ISNULL([availableQty],0) - ISNULL(@qty,0)
								 END 
					,[updatedBy] = @invokingUser
					,[updatedDate] = @dt
				WHERE [guid] = @deviceItemGuid AND [isDeleted] = 0

				UPDATE [dbo].[Inventory]
				SET [quantity] = CASE WHEN @action = 'Add' THEN [quantity] + ISNULL(@qty,0)
								 ELSE [quantity] - ISNULL(@qty,0)
								 END
					,[updatedDate] = @dt
					,[refillDateTime] = @dt
					,[updatedBy] = @invokingUser
				where [guid] = @guid AND [deviceItemGuid] = @deviceItemGuid
					AND isdeleted = 0

				INSERT INTO [dbo].[DeviceItemHistory]
			           ([guid]
			           ,[deviceItemGuid]
					   ,[operation]
					   ,[refillQuantity]
			           ,[createdDate]
			           ,[createdBy]
					   ,[isDeleted]
			           )
			     VALUES
			           (NEWID()
			           ,@deviceItemGuid
					   ,@action
			           ,@qty
					   ,@dt
			           ,@invokingUser
					   ,0
					   );
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