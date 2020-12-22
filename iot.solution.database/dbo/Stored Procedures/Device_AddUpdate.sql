/*******************************************************************
DECLARE @output INT = 0
	,@fieldName	nvarchar(255)
	,@newid UNIQUEIDENTIFIER

EXEC [dbo].[Device_AddUpdate]
	@guid					= '3141C24F-81E5-48D2-BD55-2488117C0FDC'
	,@companyGuid			= 'F29BE816-76B7-4E90-A9BC-20BE896A8C81'
	,@entityGuid			= '6A783803-3172-449B-94CE-CF10C2B95F23'
	,@templateGuid			= '12A5CD86-F6C6-455F-B27A-EFE587ED410D'
	,@parentDeviceGuid		= '12A5CD86-F6C6-455F-B27A-EFE587ED410D'
	,@typeGuid				= '12A5CD86-F6C6-455F-B27A-EFE587ED410D'
	,@uniqueId				= 'Device656 uniqueId'
	,@name					= 'Device 656 name'
	,@note					= 'Device 656 note'
	,@tag					= 'Device 656 tag'
	,@image					= 'sdfsdfsdfsdf.jpg'
	,@isProvisioned			= 0
	,@shelfData				= '<ArrayOfShelfs>
									<Shelfs>
									<Sequence>2</Sequence>
									<ShelfID>ShelfID2</ShelfID>
									<PGuid>3187b46f-1bf7-4207-996f-03a1ecbeb5b0</PGuid>
									<Capacity>10</Capacity>
									</Shelfs>
							   </ArrayOfShelfs>'
	,@invokingUser			= '200EDCFA-8FF1-4837-91B1-7D5F967F5129'
	,@version				= 'v1'
	,@output				= @output		OUTPUT
	,@fieldName				= @fieldName	OUTPUT
	,@newid					= @newid		OUTPUT

SELECT @output status, @fieldName fieldname,@newid newid

001	sgh-1 05-12-2019 [Nishit Khakhi]	Added Initial Version to Add Update Device
*******************************************************************/

CREATE PROCEDURE [dbo].[Device_AddUpdate]
(	@guid				UNIQUEIDENTIFIER
	,@companyGuid		UNIQUEIDENTIFIER
	,@entityGuid		UNIQUEIDENTIFIER
	,@parentDeviceGuid	UNIQUEIDENTIFIER	= NULL
	,@templateGuid		UNIQUEIDENTIFIER
	,@typeGuid			UNIQUEIDENTIFIER	
	,@uniqueId			NVARCHAR(500)
	,@name	 			NVARCHAR(500)
	,@description		NVARCHAR(1000)		= NULL
	,@specification		NVARCHAR(1000)		= NULL
	,@note				NVARCHAR(1000)		= NULL
	,@tag				NVARCHAR(50)		= NULL
	,@image				NVARCHAR(200)		= NULL
	,@isProvisioned		BIT					= 0
	,@shelfData			XML					= NULL
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
            SELECT 'Device_AddUpdate' AS '@procName'
			, CONVERT(nvarchar(MAX),@guid) AS '@guid'
			, CONVERT(nvarchar(MAX),@companyGuid) AS '@companyGuid'
			, CONVERT(nvarchar(MAX),@entityGuid) AS '@entityGuid'
			, CONVERT(nvarchar(MAX),@templateGuid) AS '@templateGuid'
			, CONVERT(nvarchar(MAX),@typeGuid) AS '@typeGuid'
			, @uniqueId AS '@uniqueId'
            , @name AS '@name'
			, @description AS '@description'
			, @specification AS '@specification'
			, @note AS '@note'
			, @tag AS '@tag'
			, @image AS '@image'
			, CONVERT(NVARCHAR(MAX),@shelfData) AS '@shelfData'
			, CONVERT(nvarchar(MAX),@isProvisioned) AS '@isProvisioned'
            , CONVERT(nvarchar(MAX),@invokingUser) AS '@invokingUser'
            , CONVERT(nvarchar(MAX),@version) AS '@version'
            , CONVERT(nvarchar(MAX),@output) AS '@output'
            , CONVERT(nvarchar(MAX),@fieldName) AS '@fieldName'
			, CONVERT(nvarchar(MAX),@guid) AS '@newid'
            FOR XML PATH('Params')
	    )
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), @dt)
    END

	SET @output = 1
	SET @fieldName = 'Success'
	
	BEGIN TRY
		
		IF OBJECT_ID ('tempdb..#shelf_data') IS NOT NULL DROP TABLE #shelf_data 
		CREATE TABLE #shelf_data
		(	[productTypeGuid]		UNIQUEIDENTIFIER
			,[shelfid]				NVARCHAR(200)
			,[capacity]				BIGINT
			,[sequence]				NVARCHAR(3)
		)
		INSERT INTO #shelf_data
		SELECT DISTINCT 
				TRY_CONVERT(UNIQUEIDENTIFIER, x.R.value('PGuid[1]', 'NVARCHAR(50)')) AS 'productTypeGuid'
				, x.R.value('ShelfID[1]', 'NVARCHAR(200)') AS 'shelfid'
				, x.R.value('Capacity[1]', 'BIGINT') AS [capacity]
				, x.R.value('Sequence[1]','NVARCHAR(3)') AS [sequence]
		FROM @shelfData.nodes('/ArrayOfShelfs/Shelfs') as x(R)

		IF EXISTS (SELECT TOP 1 [shelfid] FROM #shelf_data GROUP BY [shelfid] HAVING COUNT(1) > 1)
		BEGIN
			SET @output = -3
			SET @fieldName = 'ShelfIDSouldBeUnique'
			RETURN;
		END
		IF EXISTS(SELECT TOP 1 1 FROM #shelf_data s INNER JOIN [dbo].[DeviceItem] DI (NOLOCK) ON s.[shelfid] = DI.[uniqueId] AND DI.[isdeleted] = 0)
		BEGIN	
			SET @output = -3
			SET @fieldName = 'ShelfIDAlreadyExists'
			RETURN;
		END

		SET @newid = @guid
		BEGIN TRAN
			IF NOT EXISTS(SELECT TOP 1 1 FROM [dbo].[Device] (NOLOCK) where [guid] = @guid AND companyGuid = @companyGuid AND isdeleted = 0)
			BEGIN	
				INSERT INTO [dbo].[Device]
			           ([guid]
			           ,[companyGuid]
			           ,[entityGuid]
			           ,[templateGuid]
					   ,[parentDeviceGuid]
			           ,[typeGuid]
			           ,[uniqueId]
			           ,[name]
					   ,[description]
					   ,[specification]
					   ,[note]
					   ,[tag]
					   ,[image]
					   ,[isProvisioned]
			           ,[isActive]
					   ,[isDeleted]
			           ,[createdDate]
			           ,[createdBy]
			           ,[updatedDate]
			           ,[updatedBy]
						)
			     VALUES
			           (@guid
			           ,@companyGuid
			           ,@entityGuid
			           ,@templateGuid
					   ,@parentDeviceGuid
			           ,@typeGuid
			           ,@uniqueId
			           ,@name
					   ,@description
					   ,@specification
					   ,@note
			           ,@tag
			           ,@image
					   ,@isProvisioned
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
				UPDATE [dbo].[Device]
				SET	[entityGuid] = @entityGuid
					,[parentDeviceGuid] = @parentDeviceGuid
					,[templateGuid] = @templateGuid
					,[typeGuid] = @typeGuid
					,[name] = @name
					,[description] = @description
					,[specification] = @specification
					,[tag] = ISNULL(@tag,[tag])
					,[note] = ISNULL(@note,[note])
					,[isProvisioned] = @isProvisioned
					,[updatedDate] = @dt
					,[updatedBy] = @invokingUser
				WHERE [guid] = @guid AND [companyGuid] = @companyGuid AND [isDeleted] = 0
			END
		
			INSERT INTO DeviceItem (
				[guid]
				,[deviceGuid]
				,[productTypeGuid]
				,[uniqueId]
				,[capacity]
				,[availableQty]
				,[sequence]
				,[isActive]
				,[isDeleted]
				,[createdBy]
				,[createdDate]
				,[updatedBy]
				,[updatedDate]
				)
			SELECT	NEWID()
					, @newid
					, [productTypeGuid]
					, [shelfid]
					, [capacity]
					, 0
					, [sequence]
					, 1
					, 0
					, @invokingUser
					, @dt
					, @invokingUser
					, @dt
			FROM #shelf_data

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