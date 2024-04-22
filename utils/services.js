function check_body_schema(body, schema) {
    for (let attribute in schema) {
        if (schema[attribute][1]){
            if (typeof body[attribute] !== schema[attribute][0]) {
                return false;
            }
        } else {
            if (body[attribute]){
                if (typeof body[attribute] !== schema[attribute][0]){
                    return false
                }
            }
        }
    }
    return true;
}
exports.check_body_schema = check_body_schema;
