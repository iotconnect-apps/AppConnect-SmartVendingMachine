CREATE PROCEDURE [dbo].[IOTConnectAlert_Add]
(	
	@data XML
)
AS
BEGIN
    SET NOCOUNT ON
	
	INSERT INTO IOTConnectAlert
	SELECT DISTINCT NEWID() AS [guid]
	, x.R.query('message').value('.', 'NVARCHAR(500)') AS 'message'
	, x.R.query('companyGuid').value('.', 'UNIQUEIDENTIFIER') AS 'companyGuid'
	, x.R.query('condition').value('.', 'NVARCHAR(1000)') AS 'condition'
	, x.R.query('deviceGuid').value('.', 'UNIQUEIDENTIFIER') AS 'deviceGuid'
	, x.R.query('entityGuid').value('.', 'UNIQUEIDENTIFIER') AS 'entityGuid'
	, x.R.query('eventDate').value('.', 'DATETIME') AS 'eventDate'
	, x.R.query('uniqueId').value('.', 'NVARCHAR(50)') AS 'uniqueId'
	, x.R.query('audience').value('.', 'NVARCHAR(2000)') AS 'audience'
	, x.R.query('eventId').value('.', 'NVARCHAR(50)') AS 'eventId'
	, x.R.query('refGuid').value('.', 'UNIQUEIDENTIFIER') AS 'refGuid'
	, x.R.query('severity').value('.', 'NVARCHAR(50)') AS 'severity'
	, x.R.query('ruleName').value('.', 'NVARCHAR(50)') AS 'ruleName'
	, x.R.query('data').value('.', 'NVARCHAR(2000)') AS 'data'
	FROM @data.nodes('/IOTAlertMessage') as x(R)
END