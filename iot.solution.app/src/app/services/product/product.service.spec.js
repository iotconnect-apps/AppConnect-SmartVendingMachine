"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var product_service_1 = require("./product.service");
describe('ProductService', function () {
    beforeEach(function () { return testing_1.TestBed.configureTestingModule({}); });
    it('should be created', function () {
        var service = testing_1.TestBed.get(product_service_1.ProductService);
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=product.service.spec.js.map