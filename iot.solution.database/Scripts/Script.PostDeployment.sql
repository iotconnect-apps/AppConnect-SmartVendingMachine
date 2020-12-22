DECLARE @dt DATETIME = GETUTCDATE()
IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'db-version')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'cf45da4c-1b49-49f5-a5c3-8bc29c1999ea', N'db-version', N'0', 0, CAST(N'2020-04-08T13:16:53.940' AS DateTime), NULL, CAST(N'2020-04-08T13:16:53.940' AS DateTime), NULL)
END

IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'telemetry-last-exectime')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'465970b2-8bc3-435f-af97-8ca26f2bf383', N'telemetry-last-exectime', N'2020-04-25 12:08:02.380', 0, CAST(N'2020-04-25T06:41:01.030' AS DateTime), NULL, CAST(N'2020-04-25T06:41:01.030' AS DateTime), NULL)
END

IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'shelfConsuption-last-updatetime')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'594C9530-D7C5-4A62-AAD0-D297414BBB10', N'shelfConsuption-last-updatetime', N'2020-05-25 12:08:02.380', 0, CAST(N'2020-04-25T06:41:01.030' AS DateTime), NULL, CAST(N'2020-04-25T06:41:01.030' AS DateTime), NULL)
END

IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'shelfConsuption-frequency')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'7B8C9404-DAA6-4F6E-8268-A07BEF1F0C7D', N'shelfConsuption-frequency', N'05', 0, CAST(N'2020-05-25T06:41:01.030' AS DateTime), NULL, CAST(N'2020-05-25T06:41:01.030' AS DateTime), NULL)
END

IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'threshold-limit')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'BC9B95E3-8ADF-4E56-B6A1-128C1BB8ACF6', N'threshold-limit', N'20.00', 0, CAST(N'2020-05-25T06:41:01.030' AS DateTime), NULL, CAST(N'2020-05-25T06:41:01.030' AS DateTime), NULL)
END

DECLARE @DBVersion FLOAT  = 0
SELECT @DBVersion = CONVERT(FLOAT,[value]) FROM dbo.[configuration] WHERE [configKey] = 'db-version'

IF @DBVersion < 1 
BEGIN
INSERT [dbo].[KitType] ([guid], [companyGuid], [name], [code], [tag], [isActive], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', NULL, N'Default', N'Default', NULL, 1, 0, CAST(N'2020-05-12T13:20:44.217' AS DateTime), N'68aa338c-ebd7-4686-b350-de844c71db1f', NULL, NULL)
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'1805A278-BB74-42FE-AD53-2313015C180F', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N'voltage', N'voltage', NULL, N'voltage')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'7DFF7A2C-DE14-4068-9BDD-4CCBE051CF11', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N'currentin', N'currentin', NULL, N'currentin')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'57D33892-B74B-4966-9269-859BA2872494', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N'temp', N'temp', NULL, N'temperature')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'804860f7-e0b0-47cc-88f0-65557eb26bf6', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N't1', N't1', NULL, N'dispatched item count t1')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'2e03ba85-bdf8-4133-9c79-67eb5c07c1e2', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N't2', N't2', NULL, N'dispatched item count t2')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'3e8fe951-4b00-401d-86bf-c2043379fa70', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N't3', N't3', NULL,  N'dispatched item count t3')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'5E5D834D-CAC2-4AA5-BC2E-1DC85A6F9406', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N'humidity', N'humidity', NULL, N'humidity')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'FFD93F53-F6DB-43BC-903D-749223B99C9F', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N'vibration', N'vibration', NULL, N'vibration')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'DEEB17F9-F602-4E4C-9028-2F866C73CE5F', NULL, N'5DD233D4-7B05-4B1C-85EC-1AD7B13C7916', N'doorstatus', N'doorstatus', NULL,  N'doorstatus')
INSERT INTO [dbo].[AdminUser] ([guid],[email],[companyGuid],[firstName],[lastName],[password],[isActive],[isDeleted],[createdDate]) VALUES (NEWID(),'admin@vendingmachine.com','AB469212-2488-49AD-BC94-B3A3F45590D2','Vending Machine','admin','Softweb#123',1,0,GETUTCDATE())

INSERT INTO [dbo].[DeviceType]([guid],[name],[isActive],[isDeleted],[createdDate],[createdBy],[updatedDate],[updatedBy]) VALUES ('AC9389D3-C832-4AEB-B061-9E372EDB7E48','Type1',1,0,@dt,NULL,@dt,NULL)
INSERT INTO [dbo].[DeviceType]([guid],[name],[isActive],[isDeleted],[createdDate],[createdBy],[updatedDate],[updatedBy]) VALUES ('0EC77B10-71D4-45E6-8793-06266732A0F3','Type2',1,0,@dt,NULL,@dt,NULL)
INSERT INTO [dbo].[DeviceType]([guid],[name],[isActive],[isDeleted],[createdDate],[createdBy],[updatedDate],[updatedBy]) VALUES ('8783388F-828E-428D-AB5A-7633FFC89470','Type3',1,0,@dt,NULL,@dt,NULL)

INSERT [dbo].[ProductType] ([guid], [typeName], [isActive], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'3187b46f-1bf7-4207-996f-03a1ecbeb5b0', N'Chocolate', 1, 0, CAST(N'2020-05-18T14:03:12.107' AS DateTime), N'85ef14d3-9807-40da-a85b-f80b05ff0941', CAST(N'2020-05-18T14:03:12.107' AS DateTime), N'7eaba9c4-185a-4e64-a396-6f2146d18fb3')
INSERT [dbo].[ProductType] ([guid], [typeName], [isActive], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'5b71458b-7470-4bd2-8511-432bab3ddb69', N'Cold Drink Tin', 1, 0, CAST(N'2020-05-18T14:02:56.880' AS DateTime), N'cdcd6f79-8719-4730-b8bf-19354a2baa9b', CAST(N'2020-05-18T14:02:56.880' AS DateTime), N'9b8b2ebf-d180-46dd-805e-416b9d1d1f2c')
INSERT [dbo].[ProductType] ([guid], [typeName], [isActive], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'36d2855f-6a18-4800-9eea-4c12153e3001', N'Cold Drink Bottle', 1, 0, CAST(N'2020-05-18T14:02:51.427' AS DateTime), N'58e107da-5d6e-4a48-965c-441797ad064a', CAST(N'2020-05-18T14:02:51.427' AS DateTime), N'7d62c4b5-f3ce-483a-a7a3-c6317fc877fe')
INSERT [dbo].[ProductType] ([guid], [typeName], [isActive], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'0ef9c4af-6812-4dec-80ab-f40d5ce21af3', N'Chips', 1, 0, CAST(N'2020-05-18T14:02:29.410' AS DateTime), N'a28c3300-9d3b-418c-b805-0dee8dbe6a45', CAST(N'2020-05-18T14:02:29.410' AS DateTime), N'8a77698f-1c9c-49f4-9848-8648d26150a9')

INSERT [dbo].[UserDasboardWidget] ([Guid], [DashboardName], [Widgets], [IsDefault], [IsSystemDefault], [UserId], [IsActive], [IsDeleted], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (N'2AFB7737-9F88-4BD1-9447-14D495E40DE0', N'Default Dashboard', N'[]', 0, 1, N'00000000-0000-0000-0000-000000000000', 1, 0, CAST(N'2020-07-06T14:52:39.567' AS DateTime), N'00000000-0000-0000-0000-000000000000', CAST(N'2020-07-06T14:53:09.490' AS DateTime), N'00000000-0000-0000-0000-000000000000')

UPDATE [dbo].[Configuration]
SET [value]  = '1'
WHERE [configKey] = 'db-version'

END

GO