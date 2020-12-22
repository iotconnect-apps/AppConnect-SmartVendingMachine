/*******************************************************************
DECLARE @output INT = 0
	,@fieldName	nvarchar(255)
	,@newid UNIQUEIDENTIFIER

EXEC [dbo].[Inventory_Add]
	@companyGuid		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@entityGuid		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@deviceGuid		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@deviceItemGuid	= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@productTypeGuid	= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@productGuid		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@qty				= 1500
	,@refillDate		= ''
	,@isClearShelf		= 0
	,@invokingUser		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT
	,@newid				= @newid		OUTPUT

SELECT @output status, @fieldName fieldname,@newid newid

001	SVM-4 14-05-2020 [Nishit Khakhi]	Added Initial Version to Add Update Inventory
*******************************************************************/
CREATE PROCEDURE [dbo].[Inventory_Add]
(	@companyGuid		UNIQUEIDENTIFIER
	,@entityGuid		UNIQUEIDENTIFIER
	,@deviceGuid		UNIQUEIDENTIFIER
	,@deviceItemGuid	UNIQUEIDENTIFIER
	,@productGuid		UNIQUEIDENTIFIER
	,@qty	 			BIGINT
	,@refillDate		DATETIME			= NULL
	,@isClearShelf		BIT					= 0
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
            SELECT 'Inventory_Add' AS '@procName'
				, CONVERT(nvarchar(50),@companyGuid) AS '@companyGuid'
				, CONVERT(nvarchar(50),@entityGuid) AS '@entityGuid'
				, CONVERT(nvarchar(50),@deviceGuid) AS '@deviceGuid'
				, CONVERT(nvarchar(50),@deviceItemGuid) AS '@deviceItemGuid'
				, CONVERT(nvarchar(50),@productGuid) AS '@productGuid'
				, CONVERT(nvarchar(15),@qty) AS '@qty'
				, CONVERT(nvarchar(15),@refillDate) AS '@refillDate'
				, CONVERT(NVARCHAR(1),@isClearShelf) AS '@isClearShelf'
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
		IF EXISTS (SELECT TOP 1 1 FROM [Inventory] (NOLOCK) WHERE companyGuid = @companyGuid
									AND [deviceGuid] = @deviceGuid
									AND [deviceItemGuid] = @deviceItemGuid
									AND isdeleted = 0 And @isClearShelf=0)
			BEGIN
				SET @output = -3
				SET @fieldname = 'InventoryAlreadyExists'		 
				RETURN;
			END
		IF EXISTS (SELECT TOP 1 1 FROM [DeviceItem] (NOLOCK) WHERE [deviceGuid] = @deviceGuid
									AND [guid] = @deviceItemGuid
									AND [capacity] < [availableQty] + @qty
									AND isdeleted = 0 And @isClearShelf=0)
			BEGIN
				SET @output = -3
				SET @fieldname = 'RefillQuantityMustBeLessThanCapacity'		 
				RETURN;
			END
		SET @newid = NEWID()
		BEGIN TRAN
				IF @isClearShelf = 1 
				BEGIN
					IF EXISTS (SELECT TOP 1 1 FROM dbo.[DeviceItemHistory] (NOLOCK) WHERE [deviceItemGuid] = @deviceItemGuid AND [isDeleted] = 0)
					BEGIN
						UPDATE dbo.[DeviceItemHistory]
						SET [isDeleted] = 1
						WHERE [deviceItemGuid] = @deviceItemGuid AND [isDeleted] = 0
					END

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
								WHERE [deviceGuid] = @deviceGuid AND [guid] = @deviceItemGuid AND [isDeleted] = 0 
								ORDER BY createdDate DESC
					
					IF EXISTS (SELECT TOP 1 1 FROM [dbo].[Inventory] (NOLOCK) WHERE [companyGuid] = @companyGuid AND [deviceGuid] = @deviceGuid AND [deviceItemGuid] = @deviceItemGuid AND [isDeleted] = 0)
					BEGIN
						UPDATE [dbo].[Inventory]
						SET [quantity] = @qty
							, [refillDateTime] = @refillDate
							, [updatedBy] = @invokingUser
							, [updatedDate] = @dt
						WHERE [companyGuid] = @companyGuid AND [deviceGuid] = @deviceGuid AND [deviceItemGuid] = @deviceItemGuid AND [isDeleted] = 0
   					END
					ELSE
					BEGIN
						INSERT INTO [dbo].[Inventory]
						   ([guid]
						   ,[companyGuid]
						   ,[entityGuid]
						   ,[productGuid]
						   ,[deviceGuid]
						   ,[deviceItemGuid]
						   ,[quantity]
						   ,[refillDateTime]
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
						   ,@entityGuid
						   ,@productGuid
						   ,@deviceGuid
						   ,@deviceItemGuid
						   ,@qty
						   ,@refillDate
						   ,1
						   ,0
						   ,@dt
						   ,@invokingUser				   
						   ,@dt
						   ,@invokingUser				   
						   );
					END
					
					UPDATE [dbo].[DeviceItem]
					SET [availableQty] = @qty 
						,[updatedBy] = @invokingUser
						,[updatedDate] = @dt 
					WHERE [deviceGuid] = @deviceGuid AND [guid] = @deviceItemGuid AND [isDeleted] = 0

				END
				ELSE
				BEGIN
					INSERT INTO [dbo].[Inventory]
						   ([guid]
						   ,[companyGuid]
						   ,[entityGuid]
						   ,[productGuid]
						   ,[deviceGuid]
						   ,[deviceItemGuid]
						   ,[quantity]
						   ,[refillDateTime]
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
						   ,@entityGuid
						   ,@productGuid
						   ,@deviceGuid
						   ,@deviceItemGuid
						   ,@qty
						   ,@refillDate
						   ,1
						   ,0
						   ,@dt
						   ,@invokingUser				   
						   ,@dt
						   ,@invokingUser				   
						   );
				
				
						   
					UPDATE [dbo].[DeviceItem]
					SET [availableQty] = ISNULL([availableQty],0) + @qty 
						,[updatedBy] = @invokingUser
						,[updatedDate] = @dt 
					WHERE [deviceGuid] = @deviceGuid AND [guid] = @deviceItemGuid AND [isDeleted] = 0
				END
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
						   ,'Add'
						   , @qty
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