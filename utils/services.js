function check_body_schema(body, schema) {
    let errors = [];
    for (let attribute in schema) {
        if (schema[attribute][1]){
            if (typeof body[attribute] !== schema[attribute][0]) {
                errors.push(attribute);
            }
        } else {
            if (body[attribute]){
                if (typeof body[attribute] !== schema[attribute][0]){
                    errors.push(attribute)
                }
            }
        }
    }
    return errors;
}
exports.check_body_schema = check_body_schema;
