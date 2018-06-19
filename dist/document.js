"use strict";
// document.ts
Object.defineProperty(exports, "__esModule", { value: true });
const schema = require("./schema.json");
const jsonValidator = require("is-my-json-valid");
const fs = require('fs');
const YAML = require('yaml-js');
// build a swagger validator from the official v2.0 schema
const schemaValidator = jsonValidator(schema);
/*
 * Validate a swagger document against the 2.0 schema, returning a typed Document object.
 */
function validateDocument(document) {
    if (!schemaValidator(document)) {
        return;
    }
    return document;
}
exports.validateDocument = validateDocument;
/*
 * Load a swagger document.  We only support YAML for now.
 */
function loadDocumentSync(file) {
    return YAML.load(fs.readFileSync(file, 'utf-8'));
}
exports.loadDocumentSync = loadDocumentSync;
//# sourceMappingURL=document.js.map