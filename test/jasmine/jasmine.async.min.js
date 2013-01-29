// Jasmine.Async, v0.1.0
// Copyright (c)2012 Muted Solutions, LLC. All Rights Reserved.
// Distributed under MIT license
// http://github.com/derickbailey/jasmine.async
this.AsyncSpec=function(a){function b(a){return function(){var b=!1,c=function(){b=!0};runs(function(){a(c)}),waitsFor(function(){return b})}}function c(a){this.spec=a}return c.prototype.beforeEach=function(a){this.spec.beforeEach(b(a))},c.prototype.afterEach=function(a){this.spec.afterEach(b(a))},c.prototype.it=function(c,d){a.it(c,b(d))},c}(this);