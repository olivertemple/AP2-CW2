function check_body_schema(body, schema) {
    for (let attribute in schema) {
        if (typeof body[attribute] !== schema[attribute]) {
            return false;
        }
    }
    return true;
}
exports.check_body_schema = check_body_schema;
