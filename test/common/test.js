/* globals chai, assert, fido2Helpers
   WebAuthnHelpers, Msg, ServerResponse,
   CreateOptionsRequest, CreateOptions,
   CredentialAttestation,
   GetOptionsRequest, GetOptions,
   CredentialAssertion,
   WebAuthnOptions
 */

"use strict";

var waApp;
if (typeof module === "object" && module.exports) {
    // node.js setup
    global.assert = require("chai").assert; // eslint-disable-line global-require
    global.fido2Helpers = require("fido2-helpers"); // eslint-disable-line global-require
    waApp = require("../../dist/webauthn-simple-app"); // eslint-disable-line global-require
} else {
    // browser setup
    window.assert = chai.assert;
    waApp = window.WebAuthnSimpleApp;
    mocha.setup("bdd");
}

var WebAuthnHelpers = waApp.WebAuthnHelpers;
var Msg = waApp.Msg;
var ServerResponse = waApp.ServerResponse;
var CreateOptionsRequest = waApp.CreateOptionsRequest;
var CreateOptions = waApp.CreateOptions;
var CredentialAttestation = waApp.CredentialAttestation;
var GetOptionsRequest = waApp.GetOptionsRequest;
var GetOptions = waApp.GetOptions;
var CreateOptionsRequest = waApp.CreateOptionsRequest;
var CredentialAssertion = waApp.CredentialAssertion;
var WebAuthnOptions = waApp.WebAuthnOptions;

describe("defaultRoutes", function() {
    var defaultRoutes = waApp.WebAuthnHelpers.defaultRoutes;
    it("is object", function() {
        assert.isObject(defaultRoutes);
    });

    it("has attestationOptions", function() {
        assert.isString(defaultRoutes.attestationOptions);
        assert.strictEqual(defaultRoutes.attestationOptions, "/attestation/options");
    });
    it("has attestationResult", function() {
        assert.isString(defaultRoutes.attestationResult);
        assert.strictEqual(defaultRoutes.attestationResult, "/attestation/result");
    });

    it("has assertionOptions", function() {
        assert.isString(defaultRoutes.assertionOptions);
        assert.strictEqual(defaultRoutes.assertionOptions, "/assertion/options");
    });

    it("has assertionResult", function() {
        assert.isString(defaultRoutes.assertionResult);
        assert.strictEqual(defaultRoutes.assertionResult, "/assertion/result");
    });

});

describe("coerceToBase64Url", function() {
    var coerceToBase64Url = WebAuthnHelpers.utils.coerceToBase64Url;

    it("exists", function() {
        assert.isFunction(coerceToBase64Url);
    });

    it("coerce ArrayBuffer to base64url", function() {
        var ab = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]).buffer;
        var res = coerceToBase64Url(ab);
        assert.isString(res);
        assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
    });

    it("coerce Uint8Array to base64url", function() {
        var buf = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]);
        var res = coerceToBase64Url(buf);
        assert.isString(res);
        assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
    });

    it("coerce Array to base64url", function() {
        var arr = [
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ];
        var res = coerceToBase64Url(arr);
        assert.isString(res);
        assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
    });

    it("coerce base64 to base64url", function() {
        var b64 = "AAECAwQFBgcJCgsMDQ4/+A==";
        var res = coerceToBase64Url(b64);
        assert.isString(res);
        assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
    });

    it("coerce base64url to base64url", function() {
        var b64url = "AAECAwQFBgcJCgsMDQ4_-A";
        var res = coerceToBase64Url(b64url);
        assert.isString(res);
        assert.strictEqual(res, "AAECAwQFBgcJCgsMDQ4_-A");
    });

    it("throws on incompatible: number", function() {
        assert.throws(() => {
            coerceToBase64Url(42, "test.number");
        }, Error, "could not coerce 'test.number' to string");
    });

    it("throws on incompatible: undefined", function() {
        assert.throws(() => {
            coerceToBase64Url(undefined, "test.number");
        }, Error, "could not coerce 'test.number' to string");
    });
});

describe("coerceToArrayBuffer", function() {
    var coerceToArrayBuffer = WebAuthnHelpers.utils.coerceToArrayBuffer;

    it("exists", function() {
        assert.isFunction(coerceToArrayBuffer);
    });

    it("coerce base64url to ArrayBuffer", function() {
        var b64url = "AAECAwQFBgcJCgsMDQ4_-A";
        var res = coerceToArrayBuffer(b64url);
        assert.instanceOf(res, ArrayBuffer);
        var expectedAb = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]).buffer;
        assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
    });

    it("coerce base64 to ArrayBuffer", function() {
        var b64 = "AAECAwQFBgcJCgsMDQ4/+A==";
        var res = coerceToArrayBuffer(b64);
        assert.instanceOf(res, ArrayBuffer);
        var expectedAb = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]).buffer;
        assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
    });

    it("coerce Array to ArrayBuffer", function() {
        var arr = [
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ];
        var res = coerceToArrayBuffer(arr);
        assert.instanceOf(res, ArrayBuffer);
        var expectedAb = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]).buffer;
        assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
    });

    it("coerce Uint8Array to ArrayBuffer", function() {
        var buf = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]);
        var res = coerceToArrayBuffer(buf);
        assert.instanceOf(res, ArrayBuffer);
        var expectedAb = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]).buffer;
        assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
    });

    it("coerce ArrayBuffer to ArrayBuffer", function() {
        var ab = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]).buffer;
        var res = coerceToArrayBuffer(ab);
        assert.instanceOf(res, ArrayBuffer);
        var expectedAb = Uint8Array.from([
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x3F, 0xF8
        ]).buffer;
        assert.isTrue(fido2Helpers.functions.abEqual(res, expectedAb), "got expected ArrayBuffer value");
    });

    it("throws on incompatible: number", function() {
        assert.throws(() => {
            coerceToArrayBuffer(42, "test.number");
        }, Error, "could not coerce 'test.number' to ArrayBuffer");
    });

    it("throws on incompatible: undefined", function() {
        assert.throws(() => {
            coerceToArrayBuffer(undefined, "test.number");
        }, Error, "could not coerce 'test.number' to ArrayBuffer");
    });

    it("throws on incompatible: object", function() {
        assert.throws(() => {
            coerceToArrayBuffer({}, "test.number");
        }, Error, "could not coerce 'test.number' to ArrayBuffer");
    });
});

describe("Msg", function() {
    class TestClass extends Msg {
        constructor() {
            super();

            this.propList = ["username", "displayName"];
        }
    }

    describe("from", function() {

        it("accepts object", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            assert.instanceOf(msg, Msg);
            assert.strictEqual(msg.username, "adam");
            assert.strictEqual(msg.displayName, "Adam Powers");
        });

        it("accepts string", function() {
            var json = JSON.stringify({
                username: "adam",
                displayName: "Adam Powers"
            });

            var msg = TestClass.from(json);
            assert.instanceOf(msg, Msg);
            assert.strictEqual(msg.username, "adam");
            assert.strictEqual(msg.displayName, "Adam Powers");
        });

        it("throws on no arguments", function() {
            assert.throws(() => {
                TestClass.from();
            }, TypeError, "could not coerce 'json' argument to an object");
        });

        it("throws on bad string", function() {
            assert.throws(() => {
                TestClass.from("this is a bad string");
            }, TypeError, "error parsing JSON string");
        });

        it("accepts empty object", function() {
            var msg = TestClass.from({});
            msg.propList = ["username", "displayName"];

            assert.instanceOf(msg, Msg);
            assert.isUndefined(msg.username);
            assert.isUndefined(msg.displayName);
        });
    });

    describe("toObject", function() {
        it("converts to object", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var obj = msg.toObject();
            assert.notInstanceOf(obj, Msg);
            assert.strictEqual(obj.username, "adam");
            assert.strictEqual(obj.displayName, "Adam Powers");
        });
    });

    describe("toString", function() {
        it("converts object to string", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var str = msg.toString();
            assert.isString(str);
            assert.strictEqual(str, "{\"username\":\"adam\",\"displayName\":\"Adam Powers\"}");
        });
    });

    describe("toHumanString", function() {
        it("converts object to string", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(str, "[TestClass] {\n    username: \"adam\",\n    displayName: \"Adam Powers\",\n}");
        });
    });

    describe("static toHumanString", function() {
        it("converts object to string", function() {
            var str = TestClass.toHumanString({
                username: "adam",
                displayName: "Adam Powers"
            });

            assert.isString(str);
            assert.strictEqual(str, "[TestClass] {\n    username: \"adam\",\n    displayName: \"Adam Powers\",\n}");
        });
    });

    describe("toHumanHtml", function() {
        it("converts object to string", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var str = msg.toHumanHtml();
            assert.isString(str);
            assert.strictEqual(str, "[TestClass]&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;username:&nbsp;\"adam\",<br>&nbsp;&nbsp;&nbsp;&nbsp;displayName:&nbsp;\"Adam&nbsp;Powers\",<br>}");
        });
    });
});

describe("ServerResponse", function() {
    it("is loaded", function() {
        assert.isFunction(ServerResponse);
    });

    it("is Msg class", function() {
        var msg = new ServerResponse();
        assert.instanceOf(msg, Msg);
    });

    it("has right properties", function() {
        var msg = new ServerResponse();

        assert.deepEqual(msg.propList, ["status", "errorMessage", "debugInfo"]);
    });

    it("converts correctly", function() {
        var inputObj = {
            status: "ok",
            errorMessage: ""
        };
        var msg = ServerResponse.from(inputObj);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, inputObj);
    });

    describe("validate", function() {
        it("accepts status ok", function() {
            var msg = ServerResponse.from({
                status: "ok",
                errorMessage: ""
            });

            msg.validate();
        });

        it("accepts status ok with no errorMessage", function() {
            var msg = ServerResponse.from({
                status: "ok",
            });

            msg.validate();
        });

        it("accepts status failed", function() {
            var msg = ServerResponse.from({
                status: "failed",
                errorMessage: "out of beer"
            });

            msg.validate();
        });

        it("throws on bad status", function() {
            var msg = ServerResponse.from({
                status: "foobar",
                errorMessage: ""
            });

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: foobar");
        });

        it("throws on ok with errorMessage", function() {
            var msg = ServerResponse.from({
                status: "ok",
                errorMessage: "there is no error"
            });

            assert.throws(() => {
                msg.validate();
            }, Error, "errorMessage must be empty string when status is 'ok'");
        });

        it("throws on failed with empty errorMessage", function() {
            var msg = ServerResponse.from({
                status: "failed",
                errorMessage: ""
            });

            assert.throws(() => {
                msg.validate();
            }, Error, "errorMessage must be non-zero length when status is 'failed'");
        });

        it("throws on failed without errorMessage", function() {
            var msg = ServerResponse.from({
                status: "failed",
            });

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'errorMessage' to be 'string', got: undefined");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = ServerResponse.from({
                status: "failed",
            });
            msg.decodeBinaryProperties();
        });
    });

    describe("encodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = ServerResponse.from({
                status: "failed",
            });
            msg.encodeBinaryProperties();
        });
    });

    describe("attestation debugInfo", function() {
        var debugInfo;
        beforeEach(function() {
            debugInfo =
            {
                clientData: {
                    challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
                    origin: "https://localhost:8443",
                    type: "webauthn.create",
                    tokenBinding: undefined,
                    rawClientDataJson: new ArrayBuffer(),
                    rawId: new ArrayBuffer()
                },
                authnrData: {
                    fmt: "none",
                    rawAuthnrData: new ArrayBuffer(),
                    rpIdHash: new ArrayBuffer(),
                    flags: new Set(["UP", "AT"]),
                    counter: 0,
                    aaguid: new ArrayBuffer(),
                    credIdLen: 162,
                    credId: new ArrayBuffer(),
                    credentialPublicKeyCose: new ArrayBuffer(),
                    credentialPublicKeyJwk: {
                        kty: "EC",
                        alg: "ECDSA_w_SHA256",
                        crv: "P-256",
                        x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                        y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM="
                    },
                    credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC\nFZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==\n-----END PUBLIC KEY-----\n"
                },
                audit: {
                    validExpectations: true,
                    validRequest: true,
                    complete: true,
                    warning: new Map(),
                    info: new Map([
                        ["yubico-device-id", "YubiKey 4/YubiKey 4 Nano"],
                        ["fido-u2f-transports", new Set(["usb"])],
                        ["attestation-type", "basic"],
                    ]),
                }
            };
        });

        it("is included", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.isObject(msg.debugInfo);
            assert.isObject(msg.debugInfo.clientData);
            assert.isObject(msg.debugInfo.authnrData);
        });

        it("validates", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            msg.validate();
        });

        it("encodes correctly", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
            msg.encodeBinaryProperties();
            assert.isString(msg.debugInfo.clientData.rawClientDataJson);
            assert.isString(msg.debugInfo.clientData.rawId);
            assert.isString(msg.debugInfo.authnrData.rawAuthnrData);
            assert.isString(msg.debugInfo.authnrData.rpIdHash);
            assert.isString(msg.debugInfo.authnrData.aaguid);
            assert.isString(msg.debugInfo.authnrData.credId);
            assert.isString(msg.debugInfo.authnrData.credentialPublicKeyCose);
            assert.isArray(msg.debugInfo.authnrData.flags);
        });

        it("decodes correctly", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
            msg.encodeBinaryProperties();
            assert.isString(msg.debugInfo.clientData.rawClientDataJson);
            assert.isString(msg.debugInfo.clientData.rawId);
            assert.isString(msg.debugInfo.authnrData.rawAuthnrData);
            assert.isString(msg.debugInfo.authnrData.rpIdHash);
            assert.isString(msg.debugInfo.authnrData.aaguid);
            assert.isString(msg.debugInfo.authnrData.credId);
            assert.isString(msg.debugInfo.authnrData.credentialPublicKeyCose);
            assert.isArray(msg.debugInfo.authnrData.flags);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
        });
    });

    describe.skip("assertion debugInfo", function() {
        var debugInfo;
        beforeEach(function() {
            debugInfo =
            {
                clientData: {
                    challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
                    origin: "https://localhost:8443",
                    type: "webauthn.create",
                    tokenBinding: undefined,
                    rawClientDataJson: new ArrayBuffer(),
                    rawId: new ArrayBuffer()
                },
                authnrData: {
                    fmt: "none",
                    rawAuthnrData: new ArrayBuffer(),
                    rpIdHash: new ArrayBuffer(),
                    flags: new Set(["UP", "AT"]),
                    counter: 0,
                    aaguid: new ArrayBuffer(),
                    credIdLen: 162,
                    credId: new ArrayBuffer(),
                    credentialPublicKeyCose: new ArrayBuffer(),
                    credentialPublicKeyJwk: {
                        kty: "EC",
                        alg: "ECDSA_w_SHA256",
                        crv: "P-256",
                        x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                        y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM="
                    },
                    credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC\nFZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==\n-----END PUBLIC KEY-----\n"
                }
            };
        });

        it("is included", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.isObject(msg.debugInfo);
            assert.isObject(msg.debugInfo.clientData);
            assert.isObject(msg.debugInfo.authnrData);
        });

        it("validates", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            msg.validate();
        });

        it("encodes correctly", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
            msg.encodeBinaryProperties();
            assert.isString(msg.debugInfo.clientData.rawClientDataJson);
            assert.isString(msg.debugInfo.clientData.rawId);
            assert.isString(msg.debugInfo.authnrData.rawAuthnrData);
            assert.isString(msg.debugInfo.authnrData.rpIdHash);
            assert.isString(msg.debugInfo.authnrData.aaguid);
            assert.isString(msg.debugInfo.authnrData.credId);
            assert.isString(msg.debugInfo.authnrData.credentialPublicKeyCose);
            assert.isArray(msg.debugInfo.authnrData.flags);
        });

        it("decodes correctly", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: debugInfo
            });

            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
            msg.encodeBinaryProperties();
            assert.isString(msg.debugInfo.clientData.rawClientDataJson);
            assert.isString(msg.debugInfo.clientData.rawId);
            assert.isString(msg.debugInfo.authnrData.rawAuthnrData);
            assert.isString(msg.debugInfo.authnrData.rpIdHash);
            assert.isString(msg.debugInfo.authnrData.aaguid);
            assert.isString(msg.debugInfo.authnrData.credId);
            assert.isString(msg.debugInfo.authnrData.credentialPublicKeyCose);
            assert.isArray(msg.debugInfo.authnrData.flags);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.debugInfo.clientData.rawClientDataJson, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.clientData.rawId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rawAuthnrData, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.rpIdHash, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.aaguid, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credId, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.credentialPublicKeyCose, ArrayBuffer);
            assert.instanceOf(msg.debugInfo.authnrData.flags, Set);
        });
    });


    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string for attestation", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: {
                    clientData: {
                        challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
                        origin: "https://localhost:8443",
                        type: "webauthn.create",
                        tokenBinding: undefined,
                        rawClientDataJson: new ArrayBuffer(),
                        rawId: new ArrayBuffer()
                    },
                    authnrData: {
                        fmt: "none",
                        rawAuthnrData: new ArrayBuffer(),
                        rpIdHash: new ArrayBuffer(),
                        flags: new Set(["UP", "AT"]),
                        counter: 0,
                        aaguid: new ArrayBuffer(),
                        credIdLen: 162,
                        credId: new ArrayBuffer(),
                        credentialPublicKeyCose: new ArrayBuffer(),
                        credentialPublicKeyJwk: {
                            kty: "EC",
                            alg: "ECDSA_w_SHA256",
                            crv: "P-256",
                            x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                            y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM="
                        },
                        credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC\nFZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==\n-----END PUBLIC KEY-----\n"
                    },
                    audit: {
                        validExpectations: true,
                        validRequest: true,
                        complete: true,
                        warning: new Map(),
                        info: new Map([
                            ["yubico-device-id", "YubiKey 4/YubiKey 4 Nano"],
                            ["fido-u2f-transports", new Set(["usb"])],
                            ["attestation-type", "basic"],
                        ]),
                    }
                }
            });
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[ServerResponse] {
    status: "ok",
    debugInfo: {
        clientData: {
            challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
            origin: "https://localhost:8443",
            type: "webauthn.create",
            tokenBinding: undefined,
            rawClientDataJson: [ArrayBuffer] (0 bytes),
            rawId: [ArrayBuffer] (0 bytes),
        },
        authnrData: {
            fmt: "none",
            rawAuthnrData: [ArrayBuffer] (0 bytes),
            rpIdHash: [ArrayBuffer] (0 bytes),
            flags: [
                "UP",
                "AT",
            ],
            counter: 0,
            aaguid: [ArrayBuffer] (0 bytes),
            credIdLen: 162,
            credId: [ArrayBuffer] (0 bytes),
            credentialPublicKeyCose: [ArrayBuffer] (0 bytes),
            credentialPublicKeyJwk: {
                kty: "EC",
                alg: "ECDSA_w_SHA256",
                crv: "P-256",
                x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM=",
            },
            credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----
                MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC
                FZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==
                -----END PUBLIC KEY-----
                ",
        },
        audit: {
            validExpectations: true,
            validRequest: true,
            complete: true,
            warning: {
            },
            info: {
            },
        },
    },
}`
            );
        });

        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string for assertion", function() {
            var msg = ServerResponse.from({
                status: "ok",
                debugInfo: {
                    clientData: {
                        challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
                        origin: "https://localhost:8443",
                        type: "webauthn.create",
                        tokenBinding: undefined,
                        rawClientDataJson: new ArrayBuffer(),
                        rawId: new ArrayBuffer()
                    },
                    authnrData: {
                        fmt: "none",
                        rawAuthnrData: new ArrayBuffer(),
                        rpIdHash: new ArrayBuffer(),
                        flags: new Set(["UP", "AT"]),
                        counter: 0,
                        aaguid: new ArrayBuffer(),
                        credIdLen: 162,
                        credId: new ArrayBuffer(),
                        credentialPublicKeyCose: new ArrayBuffer(),
                        credentialPublicKeyJwk: {
                            kty: "EC",
                            alg: "ECDSA_w_SHA256",
                            crv: "P-256",
                            x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                            y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM="
                        },
                        credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC\nFZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==\n-----END PUBLIC KEY-----\n"
                    },
                    audit: {
                        validExpectations: true,
                        validRequest: true,
                        complete: true,
                        warning: new Map(),
                        info: new Map([
                            ["yubico-device-id", "YubiKey 4/YubiKey 4 Nano"],
                            ["fido-u2f-transports", new Set(["usb"])],
                            ["attestation-type", "basic"],
                        ]),
                    }
                }
            });
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[ServerResponse] {
    status: "ok",
    debugInfo: {
        clientData: {
            challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
            origin: "https://localhost:8443",
            type: "webauthn.create",
            tokenBinding: undefined,
            rawClientDataJson: [ArrayBuffer] (0 bytes),
            rawId: [ArrayBuffer] (0 bytes),
        },
        authnrData: {
            fmt: "none",
            rawAuthnrData: [ArrayBuffer] (0 bytes),
            rpIdHash: [ArrayBuffer] (0 bytes),
            flags: [
                "UP",
                "AT",
            ],
            counter: 0,
            aaguid: [ArrayBuffer] (0 bytes),
            credIdLen: 162,
            credId: [ArrayBuffer] (0 bytes),
            credentialPublicKeyCose: [ArrayBuffer] (0 bytes),
            credentialPublicKeyJwk: {
                kty: "EC",
                alg: "ECDSA_w_SHA256",
                crv: "P-256",
                x: "uxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8=",
                y: "29Y5Ey4u5WGWW4MFMKagJPEJiIjzE1UFFZIRhMhqysM=",
            },
            credentialPublicKeyPem: "-----BEGIN PUBLIC KEY-----
                MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuxHN3W6ehp0VWXKaMNie1J82MVJC
                FZYScau74o17cx/b1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==
                -----END PUBLIC KEY-----
                ",
        },
        audit: {
            validExpectations: true,
            validRequest: true,
            complete: true,
            warning: {
            },
            info: {
            },
        },
    },
}`
            );
        });
    });
});

describe("CreateOptionsRequest", function() {
    it("is loaded", function() {
        assert.isFunction(CreateOptionsRequest);
    });

    it("is Msg class", function() {
        var msg = new CreateOptionsRequest();
        assert.instanceOf(msg, Msg);
    });

    it("converts correctly", function() {
        var inputObj = {
            username: "adam",
            displayName: "AdamPowers"
        };
        var msg = CreateOptionsRequest.from(inputObj);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, inputObj);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.creationOptionsRequest);
        });

        it("passes with basic args", function() {
            var msg = CreateOptionsRequest.from(testArgs);
            msg.validate();
        });

        it("throws on missing username", function() {
            delete testArgs.username;
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'username' to be 'string', got: undefined");
        });

        it("throws on empty username", function() {
            testArgs.username = "";
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'username' to be non-empty string");
        });

        it("throws on missing displayName", function() {
            delete testArgs.displayName;
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on empty displayName", function() {
            testArgs.displayName = "";
            var msg = CreateOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be non-empty string");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = CreateOptionsRequest.from(fido2Helpers.server.creationOptionsRequest);
            msg.decodeBinaryProperties();
        });
    });

    describe("encodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = CreateOptionsRequest.from(fido2Helpers.server.creationOptionsRequest);
            msg.encodeBinaryProperties();
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = CreateOptionsRequest.from(fido2Helpers.server.creationOptionsRequest);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[CreateOptionsRequest] {
    username: "bubba",
    displayName: "Bubba Smith",
    authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
        requireResidentKey: false,
        userVerification: "preferred",
    },
    attestation: "none",
}`
            );
        });
    });
});

describe("CreateOptions", function() {
    it("is loaded", function() {
        assert.isFunction(CreateOptions);
    });

    it("is ServerResponse class", function() {
        var msg = new CreateOptions();
        assert.instanceOf(msg, ServerResponse);
    });

    it("converts correctly", function() {
        var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.completeCreationOptions);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.completeCreationOptions);
        });

        it("accepts basic CreateOptions", function() {
            var msg = CreateOptions.from(fido2Helpers.server.basicCreationOptions);

            msg.validate();
        });

        it("accepts complete CreateOptions", function() {
            var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);

            msg.validate();
        });

        it("throws on bad ServerResponse", function() {
            delete testArgs.status;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: undefined");
        });

        it("throws on missing rp", function() {
            delete testArgs.rp;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rp' to be 'Object', got: undefined");
        });

        it("throws on missing rp.name", function() {
            delete testArgs.rp.name;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: undefined");
        });

        it("throws on empty rp.name", function() {
            testArgs.rp.name = "";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'name' to be non-empty string");
        });

        it("throws on non-string rp.name", function() {
            testArgs.rp.name = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: number");
        });

        it("throws on empty rp.id", function() {
            testArgs.rp.id = "";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be non-empty string");
        });

        it("throws on non-string rp.id", function() {
            testArgs.rp.id = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: number");
        });

        it("throws on empty rp.icon", function() {
            testArgs.rp.icon = "";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'icon' to be non-empty string");
        });

        it("throws on non-string rp.icon", function() {
            testArgs.rp.icon = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'icon' to be 'string', got: number");
        });

        it("throws on missing user", function() {
            delete testArgs.user;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'user' to be 'Object', got: undefined");
        });

        it("throws on missing user.name", function() {
            delete testArgs.user.name;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'name' to be 'string', got: undefined");
        });

        it("throws on missing user.displayName", function() {
            delete testArgs.user.displayName;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on missing user.id", function() {
            delete testArgs.user.id;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("throws on missing challenge", function() {
            delete testArgs.challenge;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: undefined");
        });

        it("throws on missing pubKeyCredParams", function() {
            delete testArgs.pubKeyCredParams;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'pubKeyCredParams' to be 'Array', got: undefined");
        });

        it("throws on missing pubKeyCredParams[0].type", function() {
            delete testArgs.pubKeyCredParams[0].type;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing pubKeyCredParams[0].alg", function() {
            delete testArgs.pubKeyCredParams[0].alg;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'alg' to be 'number', got: undefined");
        });

        it("throws on negative timeout", function() {
            testArgs.timeout = -1;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on timeout NaN", function() {
            testArgs.timeout = NaN;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on timeout float", function() {
            testArgs.timeout = 3.14159;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on missing excludeCredentials[0].type", function() {
            delete testArgs.excludeCredentials[0].type;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing excludeCredentials[0].id", function() {
            delete testArgs.excludeCredentials[0].id;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("allows missing excludeCredentials[0].transports", function() {
            delete testArgs.excludeCredentials[0].transports;
            var msg = CreateOptions.from(testArgs);

            msg.validate();
        });

        it("throws on non-Array excludeCredentials[0].transports", function() {
            testArgs.excludeCredentials[0].transports = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'transports' to be 'Array', got: 42");
        });

        it("throws on invalid excludeCredentials[0].transports string", function() {
            testArgs.excludeCredentials[0].transports = ["blah"];
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: blah");
        });

        it("throws on invalid excludeCredentials[0].transports type", function() {
            testArgs.excludeCredentials[0].transports = [42];
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: 42");
        });

        it("allows empty excludeCredentials[0].transports", function() {
            testArgs.excludeCredentials[0].transports = [];
            var msg = CreateOptions.from(testArgs);

            msg.validate();
        });

        it("throws on wrong type authenticatorSelection", function() {
            testArgs.authenticatorSelection = "hi";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'authenticatorSelection' to be 'Object', got: hi");
        });

        it("throws on wrong type authenticatorSelection.authenticatorAttachment", function() {
            testArgs.authenticatorSelection.authenticatorAttachment = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "authenticatorAttachment must be either 'platform' or 'cross-platform'");
        });

        it("throws on invalid authenticatorSelection.authenticatorAttachment", function() {
            testArgs.authenticatorSelection.authenticatorAttachment = "beer";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "authenticatorAttachment must be either 'platform' or 'cross-platform'");
        });

        it("throws on wrong type authenticatorSelection.userVerification", function() {
            testArgs.authenticatorSelection.userVerification = 42;
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on invalid authenticatorSelection.userVerification", function() {
            testArgs.authenticatorSelection.userVerification = "bob";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on wrong type authenticatorSelection.requireResidentKey", function() {
            testArgs.authenticatorSelection.requireResidentKey = "hi";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'requireResidentKey' to be 'boolean', got: string");
        });

        it("throws on invalid attestation", function() {
            testArgs.attestation = "hi";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected attestation to be 'direct', 'none', or 'indirect'");
        });

        it("throws on invalid extensions", function() {
            testArgs.extensions = "hi";
            var msg = CreateOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'extensions' to be 'Object', got: hi");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("decodes correct fields", function() {
            var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);
            assert.isString(msg.user.id);
            assert.isString(msg.challenge);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.user.id, ArrayBuffer);
            assert.instanceOf(msg.challenge, ArrayBuffer);
            assert.strictEqual(msg.excludeCredentials.length, 1);
            msg.excludeCredentials.forEach((cred) => {
                assert.instanceOf(cred.id, ArrayBuffer);
            });
        });
    });

    describe("encodeBinaryProperties", function() {
        it("encodes correct fields", function() {
            var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.user.id, ArrayBuffer);
            assert.instanceOf(msg.challenge, ArrayBuffer);
            assert.strictEqual(msg.excludeCredentials.length, 1);
            msg.excludeCredentials.forEach((cred) => {
                assert.instanceOf(cred.id, ArrayBuffer);
            });
            msg.encodeBinaryProperties();
            assert.isString(msg.user.id);
            assert.isString(msg.challenge);
            assert.strictEqual(msg.excludeCredentials.length, 1);
            msg.excludeCredentials.forEach((cred) => {
                assert.isString(cred.id);
            });
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = CreateOptions.from(fido2Helpers.server.completeCreationOptions);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[CreateOptions] {
    status: "ok",
    rp: {
        name: "My RP",
        id: "TXkgUlA=",
        icon: "aWNvbnBuZ2RhdGFibGFoYmxhaGJsYWg=",
    },
    user: {
        id: [ArrayBuffer] (4 bytes)
            61 64 61 6D,
        displayName: "Adam Powers",
        name: "apowers",
        icon: "aWNvbnBuZ2RhdGFibGFoYmxhaGJsYWg=",
    },
    challenge: [ArrayBuffer] (64 bytes)
        B0 FE 0C 8B 0A 1D 8E B7 82 F3 EF 34 20 C8 DC C9
        63 65 A3 F6 35 48 95 E6 16 04 0D 06 29 67 8D D7
        F7 D1 64 6C 8C 50 E1 0D 89 9F 63 8F B8 BA 1A B6
        1C 58 D8 44 46 D7 76 BE 95 8E EB F3 D9 7B D3 8C,
    pubKeyCredParams: [
        {
            alg: -7,
            type: "public-key",
        },
    ],
    timeout: 30000,
    excludeCredentials: [
        {
            type: "public-key",
            id: [ArrayBuffer] (162 bytes)
                00 08 47 ED C9 CF 44 19 1C BA 48 E7 73 61 B6 18
                CD 47 E5 D9 15 B3 D3 F5 AB 65 44 AE 10 F9 EE 99
                33 29 58 C1 6E 2C 5D B2 E7 E3 5E 15 0E 7E 20 F6
                EC 3D 15 03 E7 CF 29 45 58 34 61 36 5D 87 23 86
                28 6D 60 E0 D0 BF EC 44 6A BA 65 B1 AE C8 C7 A8
                4A D7 71 40 EA EC 91 C4 C8 07 0B 73 E1 4D BC 7E
                AD BA BF 44 C5 1B 68 9F 87 A0 65 6D F9 CF 36 D2
                27 DD A1 A8 24 15 1D 36 55 A9 FC 56 BF 6A EB B0
                67 EB 31 CD 0D 3F C3 36 B4 1B B6 92 14 AA A5 FF
                46 0D A9 E6 8E 85 ED B5 4E DE E3 89 1B D8 54 36
                05 1B,
            transports: [
                "usb",
                "nfc",
                "ble",
            ],
        },
    ],
    authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: true,
        userVerification: "required",
    },
    attestation: "direct",
    extensions: {
    },
}`
            );
        });
    });
});

describe("CredentialAttestation", function() {
    it("is loaded", function() {
        assert.isFunction(CredentialAttestation);
    });

    it("is Msg class", function() {
        var msg = new CredentialAttestation();
        assert.instanceOf(msg, Msg);
    });

    it("converts correctly", function() {
        var msg = CredentialAttestation.from(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
    });

    describe("validation", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        });

        it("passes with default args", function() {
            var msg = CredentialAttestation.from(testArgs);
            msg.validate();
        });

        it("throws on missing rawId", function() {
            delete testArgs.rawId;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: undefined");
        });

        it("throws on empty id", function() {
            testArgs.id = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be base64url format, got: ");
        });

        it("throws on non-base64url id", function() {
            testArgs.id = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be base64url format, got: ");
        });

        it("throws on base64 id", function() {
            testArgs.id = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be base64url format, got: ");
        });

        it("throws on wrong type id", function() {
            testArgs.id = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: number");
        });

        it("allows on missing id", function() {
            delete testArgs.id;
            var msg = CredentialAttestation.from(testArgs);

            msg.validate();
        });

        it("throws on empty rawId", function() {
            testArgs.rawId = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on non-base64url rawId", function() {
            testArgs.rawId = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on base64 rawId", function() {
            testArgs.rawId = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got: ");
        });

        it("throws on wrong type rawId", function() {
            testArgs.rawId = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: number");
        });

        it("throws on missing response", function() {
            delete testArgs.response;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: undefined");
        });

        it("throws on wrong type response", function() {
            testArgs.response = "beer";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: beer");
        });

        it("throws on missing response.attestationObject", function() {
            delete testArgs.response.attestationObject;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be 'string', got: undefined");
        });

        it("throws on wrong type response.attestationObject", function() {
            testArgs.response.attestationObject = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be 'string', got: number");
        });

        it("throws on empty response.attestationObject", function() {
            testArgs.response.attestationObject = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on non-base64url response.attestationObject", function() {
            testArgs.response.attestationObject = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on base64 response.attestationObject", function() {
            testArgs.response.attestationObject = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'attestationObject' to be base64url format, got: ");
        });

        it("throws on missing response.clientDataJSON", function() {
            delete testArgs.response.clientDataJSON;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: undefined");
        });

        it("throws on wrong type response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = 42;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: number");
        });

        it("throws on empty response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on non-base64url response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "beer!";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on base64 response.clientDataJSON", function() {
            testArgs.response.clientDataJSON = "Bo+VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd+GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT/e698IirQ==";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on null getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = null;
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'getClientExtensionResults' to be 'Object', got: null");
        });

        it("throws on string getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = "foo";
            var msg = CredentialAttestation.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'getClientExtensionResults' to be 'Object', got: foo");
        });

        it("allows empty Object getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = {};
            var msg = CredentialAttestation.from(testArgs);

            msg.validate();
        });

        it("allows complex Object getClientExtensionResults", function() {
            var exts = {
                foo: "bar",
                alice: {
                    goes: {
                        down: {
                            the: {
                                hole: "after the rabbit"
                            }
                        }
                    }
                },
                arr: ["a", { b: "c" }, 1, 2, 3]
            };

            testArgs.getClientExtensionResults = exts;
            var msg = CredentialAttestation.from(testArgs);
            assert.deepEqual(msg.getClientExtensionResults, exts);

            msg.validate();
        });

        describe("decodeBinaryProperties", function() {
            it("decodes correct fields", function() {
                var msg = CredentialAttestation.from(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
                assert.isString(msg.rawId);
                assert.isString(msg.id);
                assert.isString(msg.response.attestationObject);
                assert.isString(msg.response.clientDataJSON);
                msg.decodeBinaryProperties();
                assert.instanceOf(msg.rawId, ArrayBuffer);
                assert.instanceOf(msg.id, ArrayBuffer);
                assert.instanceOf(msg.response.attestationObject, ArrayBuffer);
                assert.instanceOf(msg.response.clientDataJSON, ArrayBuffer);
            });
        });

        describe("encodeBinaryProperties", function() {
            it("encodes correct fields", function() {
                var msg = CredentialAttestation.from(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
                msg.decodeBinaryProperties();
                assert.instanceOf(msg.rawId, ArrayBuffer);
                assert.instanceOf(msg.id, ArrayBuffer);
                assert.instanceOf(msg.response.attestationObject, ArrayBuffer);
                assert.instanceOf(msg.response.clientDataJSON, ArrayBuffer);
                msg.encodeBinaryProperties();
                assert.isString(msg.rawId);
                assert.isString(msg.id);
                assert.isString(msg.response.attestationObject);
                assert.isString(msg.response.clientDataJSON);
            });
        });

        describe("toHumanString", function() {
            // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
            it("creates correct string", function() {
                var msg = CredentialAttestation.from(testArgs);
                var str = msg.toHumanString();
                assert.isString(str);
                assert.strictEqual(
                    str,
                    // eslint-disable-next-line
`[CredentialAttestation] {
    rawId: [ArrayBuffer] (162 bytes)
        00 08 A2 DD 5E AC 1A 86 A8 CD 6E D3 6C D6 98 94
        96 89 E5 BA FC 4E B0 5F 45 79 E8 7D 93 BA 97 6B
        2E 73 76 B9 B6 DF D7 16 E1 64 14 0F F9 79 A6 D4
        F3 44 B5 3D 6D 26 E0 86 7B F4 14 B6 91 03 BB 65
        CB B2 DA F7 F4 11 28 35 F0 64 CB 1B 59 A8 E5 84
        A4 21 DA 8B D8 9E 38 7A 0B 7E EA B7 23 EC D7 9D
        48 4C 31 6B FB AE C5 46 01 B4 73 67 49 0A 83 9A
        DA 14 01 F3 3D 2D 25 8B 97 AE 41 8C A5 59 34 65
        29 F5 AA 37 DE 63 12 75 57 D0 43 46 C7 CD EE BD
        25 54 2F 2C 17 FC 39 38 99 52 A2 6C 3A E2 A6 A6
        A5 1C,
    id: [ArrayBuffer] (162 bytes)
        00 08 A2 DD 5E AC 1A 86 A8 CD 6E D3 6C D6 98 94
        96 89 E5 BA FC 4E B0 5F 45 79 E8 7D 93 BA 97 6B
        2E 73 76 B9 B6 DF D7 16 E1 64 14 0F F9 79 A6 D4
        F3 44 B5 3D 6D 26 E0 86 7B F4 14 B6 91 03 BB 65
        CB B2 DA F7 F4 11 28 35 F0 64 CB 1B 59 A8 E5 84
        A4 21 DA 8B D8 9E 38 7A 0B 7E EA B7 23 EC D7 9D
        48 4C 31 6B FB AE C5 46 01 B4 73 67 49 0A 83 9A
        DA 14 01 F3 3D 2D 25 8B 97 AE 41 8C A5 59 34 65
        29 F5 AA 37 DE 63 12 75 57 D0 43 46 C7 CD EE BD
        25 54 2F 2C 17 FC 39 38 99 52 A2 6C 3A E2 A6 A6
        A5 1C,
    response: {
        clientDataJSON: [ArrayBuffer] (209 bytes)
            7B 22 63 68 61 6C 6C 65 6E 67 65 22 3A 22 33 33
            45 48 61 76 2D 6A 5A 31 76 39 71 77 48 37 38 33
            61 55 2D 6A 30 41 52 78 36 72 35 6F 2D 59 48 68
            2D 77 64 37 43 36 6A 50 62 64 37 57 68 36 79 74
            62 49 5A 6F 73 49 49 41 43 65 68 77 66 39 2D 73
            36 68 58 68 79 53 48 4F 2D 48 48 55 6A 45 77 5A
            53 32 39 77 22 2C 22 63 6C 69 65 6E 74 45 78 74
            65 6E 73 69 6F 6E 73 22 3A 7B 7D 2C 22 68 61 73
            68 41 6C 67 6F 72 69 74 68 6D 22 3A 22 53 48 41
            2D 32 35 36 22 2C 22 6F 72 69 67 69 6E 22 3A 22
            68 74 74 70 73 3A 2F 2F 6C 6F 63 61 6C 68 6F 73
            74 3A 38 34 34 33 22 2C 22 74 79 70 65 22 3A 22
            77 65 62 61 75 74 68 6E 2E 63 72 65 61 74 65 22
            7D,
        attestationObject: [ArrayBuffer] (325 bytes)
            A3 63 66 6D 74 64 6E 6F 6E 65 67 61 74 74 53 74
            6D 74 A0 68 61 75 74 68 44 61 74 61 59 01 26 49
            96 0D E5 88 0E 8C 68 74 34 17 0F 64 76 60 5B 8F
            E4 AE B9 A2 86 32 C7 99 5C F3 BA 83 1D 97 63 41
            00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
            00 00 00 00 00 A2 00 08 A2 DD 5E AC 1A 86 A8 CD
            6E D3 6C D6 98 94 96 89 E5 BA FC 4E B0 5F 45 79
            E8 7D 93 BA 97 6B 2E 73 76 B9 B6 DF D7 16 E1 64
            14 0F F9 79 A6 D4 F3 44 B5 3D 6D 26 E0 86 7B F4
            14 B6 91 03 BB 65 CB B2 DA F7 F4 11 28 35 F0 64
            CB 1B 59 A8 E5 84 A4 21 DA 8B D8 9E 38 7A 0B 7E
            EA B7 23 EC D7 9D 48 4C 31 6B FB AE C5 46 01 B4
            73 67 49 0A 83 9A DA 14 01 F3 3D 2D 25 8B 97 AE
            41 8C A5 59 34 65 29 F5 AA 37 DE 63 12 75 57 D0
            43 46 C7 CD EE BD 25 54 2F 2C 17 FC 39 38 99 52
            A2 6C 3A E2 A6 A6 A5 1C A5 01 02 03 26 20 01 21
            58 20 BB 11 CD DD 6E 9E 86 9D 15 59 72 9A 30 D8
            9E D4 9F 36 31 52 42 15 96 12 71 AB BB E2 8D 7B
            73 1F 22 58 20 DB D6 39 13 2E 2E E5 61 96 5B 83
            05 30 A6 A0 24 F1 09 88 88 F3 13 55 05 15 92 11
            84 C8 6A CA C3,
    },
}`
                );
            });
        });
    });
});

describe("GetOptionsRequest", function() {
    it("is loaded", function() {
        assert.isFunction(GetOptionsRequest);
    });

    it("is Msg class", function() {
        var msg = new GetOptionsRequest();
        assert.instanceOf(msg, Msg);
    });

    it("converts correctly", function() {
        var inputObj = {
            username: "adam",
            displayName: "AdamPowers"
        };
        var msg = GetOptionsRequest.from(inputObj);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, inputObj);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.getOptionsRequest);
        });

        it("passes with basic args", function() {
            var msg = GetOptionsRequest.from(testArgs);
            msg.validate();
        });

        it("throws on missing username", function() {
            delete testArgs.username;
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'username' to be 'string', got: undefined");
        });

        it("throws on empty username", function() {
            testArgs.username = "";
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'username' to be non-empty string");
        });

        it("throws on missing displayName", function() {
            delete testArgs.displayName;
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be 'string', got: undefined");
        });

        it("throws on empty displayName", function() {
            testArgs.displayName = "";
            var msg = GetOptionsRequest.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'displayName' to be non-empty string");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = GetOptionsRequest.from(fido2Helpers.server.getOptionsRequest);
            msg.decodeBinaryProperties();
        });
    });

    describe("encodeBinaryProperties", function() {
        it("doesn't throw", function() {
            var msg = GetOptionsRequest.from(fido2Helpers.server.getOptionsRequest);
            msg.encodeBinaryProperties();
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = GetOptionsRequest.from(fido2Helpers.server.getOptionsRequest);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[GetOptionsRequest] {
    username: "bubba",
    displayName: "Bubba Smith",
}`
            );
        });
    });
});

describe("GetOptions", function() {
    it("is loaded", function() {
        assert.isFunction(GetOptions);
    });

    it("is ServerResponse class", function() {
        var msg = new GetOptions();
        assert.instanceOf(msg, ServerResponse);
    });

    it("converts correctly", function() {
        var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.completeGetOptions);
    });

    describe("validate", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.completeGetOptions);
        });

        it("allows basic data", function() {
            var msg = GetOptions.from(fido2Helpers.server.basicGetOptions);
            msg.validate();
        });

        it("allows complete data", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            msg.validate();
        });

        it("throws on missing status", function() {
            delete testArgs.status;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'status' to be 'string', got: undefined");
        });

        it("throws on missing challenge", function() {
            delete testArgs.challenge;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: undefined");
        });

        it("throws on empty challenge", function() {
            testArgs.challenge = "";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'challenge' to be base64url format, got:");
        });

        it("throws on wrong type challenge", function() {
            testArgs.challenge = {};
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'challenge' to be 'string', got: object");
        });

        it("throws on wrong type timeout", function() {
            testArgs.timeout = "beer";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be 'number', got: string");
        });

        it("throws on negative timeout", function() {
            testArgs.timeout = -1;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on NaN timeout", function() {
            testArgs.timeout = NaN;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on float timeout", function() {
            testArgs.timeout = 3.14159;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'timeout' to be positive integer");
        });

        it("throws on wrong type rpId", function() {
            testArgs.rpId = [];
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rpId' to be 'string', got: object");
        });

        it("throws on empty rpId", function() {
            testArgs.rpId = "";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rpId' to be non-empty string");
        });

        it("throws on wrong type allowCredentials", function() {
            testArgs.allowCredentials = 42;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'allowCredentials' to be 'Array', got: 42");
        });

        it("throws on missing allowCredentials[0].type", function() {
            delete testArgs.allowCredentials[0].type;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on wrong type allowCredentials[0].type", function() {
            testArgs.allowCredentials[0].type = -7;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "credential type must be 'public-key'");
        });

        it("throws on missing allowCredentials[0].id", function() {
            delete testArgs.allowCredentials[0].id;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: undefined");
        });

        it("throws on wrong type allowCredentials[0].id", function() {
            testArgs.allowCredentials[0].id = {};
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: object");
        });

        it("throws on wrong type allowCredentials[0].transports", function() {
            testArgs.allowCredentials[0].transports = "usb";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'transports' to be 'Array', got: usb");
        });

        it("throws on invalid transport", function() {
            testArgs.allowCredentials[0].transports = ["foo"];
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected transport to be 'usb', 'nfc', or 'ble', got: foo");
        });

        it("throws on wrong type userVerification", function() {
            testArgs.userVerification = 42;
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on invalid userVerification", function() {
            testArgs.userVerification = "foo";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "userVerification must be 'required', 'preferred' or 'discouraged'");
        });

        it("throws on wrong type extensions", function() {
            testArgs.extensions = "foo";
            var msg = GetOptions.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'extensions' to be 'Object', got: foo");
        });
    });

    describe("decodeBinaryProperties", function() {
        it("decodes correct fields", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            assert.isString(msg.challenge);
            msg.allowCredentials.forEach((cred) => {
                assert.isString(cred.id);
            });
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.challenge, ArrayBuffer);
            msg.allowCredentials.forEach((cred) => {
                assert.instanceOf(cred.id, ArrayBuffer);
            });
        });
    });

    describe("encodeBinaryProperties", function() {
        it("encodes correct fields", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.challenge, ArrayBuffer);
            msg.allowCredentials.forEach((cred) => {
                assert.instanceOf(cred.id, ArrayBuffer);
            });
            msg.encodeBinaryProperties();
            assert.isString(msg.challenge);
            msg.allowCredentials.forEach((cred) => {
                assert.isString(cred.id);
            });
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = GetOptions.from(fido2Helpers.server.completeGetOptions);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[GetOptions] {
    status: "ok",
    challenge: [ArrayBuffer] (64 bytes)
        B0 FE 0C 8B 0A 1D 8E B7 82 F3 EF 34 20 C8 DC C9
        63 65 A3 F6 35 48 95 E6 16 04 0D 06 29 67 8D D7
        F7 D1 64 6C 8C 50 E1 0D 89 9F 63 8F B8 BA 1A B6
        1C 58 D8 44 46 D7 76 BE 95 8E EB F3 D9 7B D3 8C,
    timeout: 60000,
    rpId: "My RP",
    allowCredentials: [
        {
            type: "public-key",
            id: [ArrayBuffer] (162 bytes)
                00 08 47 ED C9 CF 44 19 1C BA 48 E7 73 61 B6 18
                CD 47 E5 D9 15 B3 D3 F5 AB 65 44 AE 10 F9 EE 99
                33 29 58 C1 6E 2C 5D B2 E7 E3 5E 15 0E 7E 20 F6
                EC 3D 15 03 E7 CF 29 45 58 34 61 36 5D 87 23 86
                28 6D 60 E0 D0 BF EC 44 6A BA 65 B1 AE C8 C7 A8
                4A D7 71 40 EA EC 91 C4 C8 07 0B 73 E1 4D BC 7E
                AD BA BF 44 C5 1B 68 9F 87 A0 65 6D F9 CF 36 D2
                27 DD A1 A8 24 15 1D 36 55 A9 FC 56 BF 6A EB B0
                67 EB 31 CD 0D 3F C3 36 B4 1B B6 92 14 AA A5 FF
                46 0D A9 E6 8E 85 ED B5 4E DE E3 89 1B D8 54 36
                05 1B,
            transports: [
                "usb",
                "nfc",
                "ble",
            ],
        },
    ],
    userVerification: "discouraged",
    extensions: {
    },
}`
            );
        });
    });
});

describe("CredentialAssertion", function() {
    it("is loaded", function() {
        assert.isFunction(CredentialAssertion);
    });

    it("is Msg class", function() {
        var msg = new CredentialAssertion();
        assert.instanceOf(msg, Msg);
    });

    it("converts correctly", function() {
        var msg = CredentialAssertion.from(fido2Helpers.server.assertionResponseMsgB64Url);

        var outputObj = msg.toObject();

        assert.deepEqual(outputObj, fido2Helpers.server.assertionResponseMsgB64Url);
    });

    describe("validation", function() {
        var testArgs;
        beforeEach(function() {
            testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.assertionResponseMsgB64Url);
        });

        it("allows basic data", function() {
            var msg = CredentialAssertion.from(testArgs);
            msg.validate();
        });

        it("throws on missing rawId", function() {
            delete testArgs.rawId;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: undefined");
        });

        it("throws on empty rawId", function() {
            testArgs.rawId = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be base64url format, got:");
        });

        it("throws on wrong type rawId", function() {
            testArgs.rawId = 42;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'rawId' to be 'string', got: number");
        });

        it("allows missing id", function() {
            delete testArgs.id;
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("throws on empty id", function() {
            testArgs.id = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be base64url format, got:");
        });

        it("throws on wrong type id", function() {
            testArgs.id = 42;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'id' to be 'string', got: number");
        });


        it("throws on missing response", function() {
            delete testArgs.response;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: undefined");
        });

        it("throws on wrong type response", function() {
            testArgs.response = "beer";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'response' to be 'Object', got: beer");
        });

        it("throws on missing authenticatorData", function() {
            delete testArgs.response.authenticatorData;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be 'string', got: undefined");
        });

        it("throws on emtpy authenticatorData", function() {
            testArgs.response.authenticatorData = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be base64url format, got: ");
        });

        it("throws on wrong type authenticatorData", function() {
            testArgs.response.authenticatorData = /foo/;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'authenticatorData' to be 'string', got: object");
        });

        it("throws on missing clientDataJSON", function() {
            delete testArgs.response.clientDataJSON;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: undefined");
        });

        it("throws on empty clientDataJSON", function() {
            testArgs.response.clientDataJSON = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be base64url format, got: ");
        });

        it("throws on wrong type clientDataJSON", function() {
            testArgs.response.clientDataJSON = [];
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'clientDataJSON' to be 'string', got: object");
        });

        it("throws on missing signature", function() {
            delete testArgs.response.signature;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'signature' to be 'string', got: undefined");
        });

        it("throws on empty signature", function() {
            testArgs.response.signature = "";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'signature' to be base64url format, got: ");
        });

        it("throws on wrong type signature", function() {
            testArgs.response.signature = {};
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'signature' to be 'string', got: object");
        });

        it("passes on missing userHandle", function() {
            delete testArgs.response.userHandle;
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("passes on null userHandle", function() {
            testArgs.response.userHandle = null;
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("passes on empty userHandle", function() {
            testArgs.response.userHandle = "";
            var msg = CredentialAssertion.from(testArgs);
            msg.validate();
        });

        it("throws on wrong type userHandle", function() {
            testArgs.response.userHandle = 42;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'userHandle' to be null or string");
        });

        it("throws on null getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = null;
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'getClientExtensionResults' to be 'Object', got: null");
        });

        it("throws on string getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = "foo";
            var msg = CredentialAssertion.from(testArgs);

            assert.throws(() => {
                msg.validate();
            }, Error, "expected 'getClientExtensionResults' to be 'Object', got: foo");
        });

        it("allows empty Object getClientExtensionResults", function() {
            testArgs.getClientExtensionResults = {};
            var msg = CredentialAssertion.from(testArgs);

            msg.validate();
        });

        it("allows complex Object getClientExtensionResults", function() {
            var exts = {
                foo: "bar",
                alice: {
                    goes: {
                        down: {
                            the: {
                                hole: "after the rabbit"
                            }
                        }
                    }
                },
                arr: ["a", { b: "c" }, 1, 2, 3]
            };

            testArgs.getClientExtensionResults = exts;
            var msg = CredentialAssertion.from(testArgs);
            assert.deepEqual(msg.getClientExtensionResults, exts);

            msg.validate();
        });
    });

    describe("decodeBinaryProperties", function() {
        it("decodes correct fields", function() {
            var msg = CredentialAssertion.from(fido2Helpers.server.assertionResponseMsgB64Url);
            assert.isString(msg.rawId);
            assert.isString(msg.response.clientDataJSON);
            assert.isString(msg.response.signature);
            assert.isString(msg.response.authenticatorData);
            // assert.isNull(msg.response.userHandle);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.rawId, ArrayBuffer);
            assert.instanceOf(msg.response.clientDataJSON, ArrayBuffer);
            assert.instanceOf(msg.response.signature, ArrayBuffer);
            assert.instanceOf(msg.response.authenticatorData, ArrayBuffer);
            assert.instanceOf(msg.response.userHandle, ArrayBuffer);
        });
    });

    describe("encodeBinaryProperties", function() {
        it("encodes correct fields", function() {
            var msg = CredentialAssertion.from(fido2Helpers.server.assertionResponseMsgB64Url);
            msg.decodeBinaryProperties();
            assert.instanceOf(msg.rawId, ArrayBuffer);
            assert.instanceOf(msg.response.clientDataJSON, ArrayBuffer);
            assert.instanceOf(msg.response.signature, ArrayBuffer);
            assert.instanceOf(msg.response.authenticatorData, ArrayBuffer);
            assert.instanceOf(msg.response.userHandle, ArrayBuffer);
            msg.encodeBinaryProperties();
            assert.isString(msg.rawId);
            assert.isString(msg.response.clientDataJSON);
            assert.isString(msg.response.signature);
            assert.isString(msg.response.authenticatorData);
            assert.isNull(msg.response.userHandle);
        });
    });

    describe("toHumanString", function() {
        // var testArgs = fido2Helpers.functions.cloneObject(fido2Helpers.server.challengeResponseAttestationNoneMsgB64Url);
        it("creates correct string", function() {
            var msg = CredentialAssertion.from(fido2Helpers.server.assertionResponseMsgB64Url);
            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(
                str,
                // eslint-disable-next-line
`[CredentialAssertion] {
    rawId: [ArrayBuffer] (162 bytes)
        00 08 47 ED C9 CF 44 19 1C BA 48 E7 73 61 B6 18
        CD 47 E5 D9 15 B3 D3 F5 AB 65 44 AE 10 F9 EE 99
        33 29 58 C1 6E 2C 5D B2 E7 E3 5E 15 0E 7E 20 F6
        EC 3D 15 03 E7 CF 29 45 58 34 61 36 5D 87 23 86
        28 6D 60 E0 D0 BF EC 44 6A BA 65 B1 AE C8 C7 A8
        4A D7 71 40 EA EC 91 C4 C8 07 0B 73 E1 4D BC 7E
        AD BA BF 44 C5 1B 68 9F 87 A0 65 6D F9 CF 36 D2
        27 DD A1 A8 24 15 1D 36 55 A9 FC 56 BF 6A EB B0
        67 EB 31 CD 0D 3F C3 36 B4 1B B6 92 14 AA A5 FF
        46 0D A9 E6 8E 85 ED B5 4E DE E3 89 1B D8 54 36
        05 1B,
    id: [ArrayBuffer] (162 bytes)
        00 08 47 ED C9 CF 44 19 1C BA 48 E7 73 61 B6 18
        CD 47 E5 D9 15 B3 D3 F5 AB 65 44 AE 10 F9 EE 99
        33 29 58 C1 6E 2C 5D B2 E7 E3 5E 15 0E 7E 20 F6
        EC 3D 15 03 E7 CF 29 45 58 34 61 36 5D 87 23 86
        28 6D 60 E0 D0 BF EC 44 6A BA 65 B1 AE C8 C7 A8
        4A D7 71 40 EA EC 91 C4 C8 07 0B 73 E1 4D BC 7E
        AD BA BF 44 C5 1B 68 9F 87 A0 65 6D F9 CF 36 D2
        27 DD A1 A8 24 15 1D 36 55 A9 FC 56 BF 6A EB B0
        67 EB 31 CD 0D 3F C3 36 B4 1B B6 92 14 AA A5 FF
        46 0D A9 E6 8E 85 ED B5 4E DE E3 89 1B D8 54 36
        05 1B,
    response: {
        clientDataJSON: [ArrayBuffer] (206 bytes)
            7B 22 63 68 61 6C 6C 65 6E 67 65 22 3A 22 65 61
            54 79 55 4E 6E 79 50 44 44 64 4B 38 53 4E 45 67
            54 45 55 76 7A 31 51 38 64 79 6C 6B 6A 6A 54 69
            6D 59 64 35 58 37 51 41 6F 2D 46 38 5F 5A 31 6C
            73 4A 69 33 42 69 6C 55 70 46 5A 48 6B 49 43 4E
            44 57 59 38 72 39 69 76 6E 54 67 57 37 2D 58 5A
            43 33 71 51 22 2C 22 63 6C 69 65 6E 74 45 78 74
            65 6E 73 69 6F 6E 73 22 3A 7B 7D 2C 22 68 61 73
            68 41 6C 67 6F 72 69 74 68 6D 22 3A 22 53 48 41
            2D 32 35 36 22 2C 22 6F 72 69 67 69 6E 22 3A 22
            68 74 74 70 73 3A 2F 2F 6C 6F 63 61 6C 68 6F 73
            74 3A 38 34 34 33 22 2C 22 74 79 70 65 22 3A 22
            77 65 62 61 75 74 68 6E 2E 67 65 74 22 7D,
        authenticatorData: [ArrayBuffer] (37 bytes)
            49 96 0D E5 88 0E 8C 68 74 34 17 0F 64 76 60 5B
            8F E4 AE B9 A2 86 32 C7 99 5C F3 BA 83 1D 97 63
            01 00 00 01 6B,
        signature: [ArrayBuffer] (72 bytes)
            30 46 02 21 00 FA 74 5D C1 D1 9A 1A 2C 0D 2B EF
            CA 32 45 DA 0C 35 1D 1B 37 DD D9 8B 87 05 FF BE
            61 14 01 FA A5 02 21 00 B6 34 50 8B 2B 87 4D EE
            FD FE 32 28 EC 33 C0 3E 82 8F 7F C6 58 B2 62 8A
            84 D3 F7 9F 34 B3 56 BB,
        userHandle: [ArrayBuffer] (0 bytes),
    },
}`
            );
        });
    });
});

describe("WebAuthnOptions", function() {
    it("is loaded", function() {
        assert.isFunction(WebAuthnOptions);
    });

    it("is Msg class", function() {
        var msg = new WebAuthnOptions();
        assert.instanceOf(msg, Msg);
    });

    describe("merge", function() {
        it("dst over src", function() {
            var src = WebAuthnOptions.from({
                timeout: 1
            });

            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, true);

            assert.strictEqual(src.timeout, 2);
        });

        it("src over dst", function() {
            var src = WebAuthnOptions.from({
                timeout: 1
            });

            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, false);

            assert.strictEqual(src.timeout, 1);
        });

        it("sets missing values", function() {
            var src = WebAuthnOptions.from({});
            var dst = WebAuthnOptions.from({
                timeout: 2
            });

            src.merge(dst, false);

            assert.strictEqual(src.timeout, 2);
        });

        it("allows empty", function() {
            var src = WebAuthnOptions.from({});
            var dst = WebAuthnOptions.from({});

            src.merge(dst, false);

            assert.isUndefined(src.timeout);
        });
    });
});