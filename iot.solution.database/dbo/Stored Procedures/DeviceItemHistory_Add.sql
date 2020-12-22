/*******************************************************************
DECLARE @output INT = 0
	,@fieldName	nvarchar(255)
	,@newid UNIQUEIDENTIFIER

EXEC [dbo].[DeviceItemHistory_Add]
	@deviceItemGuid		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@action			= 'add'
	,@qty				= 1500
	,@invokingUser		= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT
	,@newid				= @newid		OUTPUT

SELECT @output status, @fieldName fieldname,@newid newid

001	SVM-4 18-05-2020 [Nishit Khakhi]	Added Initial Version to Add Inventory History
*******************************************************************/
CREATE PROCEDURE [dbo].[DeviceItemHistory_Add]
(	@deviceItemGuid		UNIQUEIDENTIFIER
	,@qty	 			BIGINT
	,@action			NVARCHAR(20)
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
            SELECT 'DeviceItemHistory_Add' AS '@procName'
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
		
		SET @newid = NEWID()
		BEGIN TRAN
				INSERT INTO [dbo].[DeviceItemHistory]
			           ([guid]
			           ,[deviceItemGuid]
					   ,[operation]
					   ,[refillQuantity]
			           ,[createdDate]
			           ,[createdBy]
			           )
			     VALUES
			           (@newid
			           ,@deviceItemGuid
					   ,@action
			           ,@qty
					   ,@dt
			           ,@invokingUser				   
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