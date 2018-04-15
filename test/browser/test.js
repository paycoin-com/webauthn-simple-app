/* globals chai, sinon */

"use strict";

var assert = chai.assert;
mocha.setup("bdd");

describe("webauthnApp", function() {
    var webauthnApp;
    beforeEach(function() {
        webauthnApp = new window.WebAuthnApp();
    });

    it("exists", function() {
        assert.isObject(webauthnApp);
    });

    it("is null in insecure context");
    it("is null where WebAuthn API doesn't exist");
    it("can debug");
    it("has correct interfaces");
});

var challenge = {
    challenge: "YWJjZGVmMTIzNDU2" // abcdef123456
};

describe("server comms", function() {
    var webauthnApp, server;
    beforeEach(function() {
        server = sinon.fakeServer.create();
        server.respondImmediately = true;
        webauthnApp = new window.WebAuthnApp();
    });
    afterEach(function() {
        server.restore();
    });

    function serverFake(url, data) {
        server.respondWith("POST", url, [200, {
            "Content-Type": "application/json"
        }, JSON.stringify([data])]);
    }

    it("can send", function() {
        serverFake("/foo", {
            id: 12,
            comment: "Hey there"
        });

        return webauthnApp.send("POST", "/foo", {
            test: "bar"
        });
    });

    it("can get register challenge", function() {
        serverFake("/webauthn/register/challenge", challenge);
        return webauthnApp.getRegisterChallenge("apowers");
    });

    it("can send a registration response");
    it("can get a login challenge");
    it("can send a login response");
    it("can change endpoints");
    it("can change endpoint methods");
    it("can register a callback to modify the messages to / from the server");
    it("catches error on missing endpoint");
});

describe("events", function() {
    it("fires events");
});