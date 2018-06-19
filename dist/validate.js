"use strict";
// validate.js
Object.defineProperty(exports, "__esModule", { value: true });
function isEmpty(value) {
    return value === undefined || value === '' || Object.keys(value).length === 0;
}
function validate(value, schema) {
    // if no schema, treat as an error
    if (schema === undefined) {
        return {
            actual: value,
            expected: {
                schema: undefined
            },
        };
    }
    const valid = schema.validator(value);
    if (valid) {
        return;
    }
    const error = {
        actual: value,
        expected: {
            schema: schema.schema,
            type: schema.type,
            format: schema.format
        },
    };
    const errorDetail = schema.validator.error;
    if (errorDetail) {
        error.error = errorDetail;
    }
    if (error.expected.schema === undefined) {
        delete error.expected.schema;
    }
    if (error.expected.type === undefined) {
        delete error.expected.type;
    }
    if (error.expected.format === undefined) {
        delete error.expected.format;
    }
    if (Object.keys(error.expected).length === 0) {
        // nothing is expected, so set to undefined
        error.expected = undefined;
    }
    return error;
}
function request(compiledPath, method, query, body, headers, pathParameters) {
    if (compiledPath === undefined) {
        return;
    }
    // get operation object for path and method
    const operation = compiledPath.path[method.toLowerCase()];
    if (operation === undefined) {
        // operation not defined, return 405 (method not allowed)
        return;
    }
    const parameters = operation.resolvedParameters;
    const validationErrors = [];
    let bodyDefined = false;
    // check all the parameters match swagger schema
    if (parameters.length === 0) {
        const error = validate(body, { validator: isEmpty });
        if (error !== undefined) {
            error.where = 'body';
            validationErrors.push(error);
        }
        if (query !== undefined && Object.keys(query).length > 0) {
            Object.keys(query).forEach((key) => {
                validationErrors.push({
                    where: 'query',
                    name: key,
                    actual: query[key],
                    expected: {}
                });
            });
        }
        return validationErrors;
    }
    parameters.forEach((parameter) => {
        let value;
        switch (parameter.in) {
            case 'query':
                value = (query || {})[parameter.name];
                break;
            case 'path':
                if (pathParameters) {
                    value = pathParameters[parameter.name];
                }
                else {
                    const actual = (compiledPath.requestPath || '').match(/[^\/]+/g);
                    const valueIndex = compiledPath.expected.indexOf('{' + parameter.name + '}');
                    value = actual ? actual[valueIndex] : undefined;
                }
                break;
            case 'body':
                value = body;
                bodyDefined = true;
                break;
            case 'header':
                value = (headers || {})[parameter.name];
                break;
            case 'formData':
                value = (body || {})[parameter.name];
                bodyDefined = true;
                break;
            default:
            // do nothing
        }
        const error = validate(value, parameter);
        if (error !== undefined) {
            error.where = parameter.in;
            validationErrors.push(error);
        }
    });
    // ensure body is undefined if no body schema is defined
    if (!bodyDefined && body !== undefined) {
        const error = validate(body, { validator: isEmpty });
        if (error !== undefined) {
            error.where = 'body';
            validationErrors.push(error);
        }
    }
    return validationErrors;
}
exports.request = request;
function response(compiledPath, method, status, body) {
    if (compiledPath === undefined) {
        return {
            actual: 'UNDEFINED_PATH',
            expected: 'PATH'
        };
    }
    const operation = compiledPath.path[method.toLowerCase()];
    // check the response matches the swagger schema
    let schema = operation.responses[status];
    if (schema === undefined) {
        schema = operation.responses.default;
    }
    return validate(body, schema);
}
exports.response = response;
//# sourceMappingURL=validate.js.map