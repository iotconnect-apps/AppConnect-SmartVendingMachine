"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var inventory_service_1 = require("./inventory.service");
describe('InventoryService', function () {
    beforeEach(function () { return testing_1.TestBed.configureTestingModule({}); });
    it('should be created', function () {
        var service = testing_1.TestBed.get(inventory_service_1.InventoryService);
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=inventory.service.spec.js.map