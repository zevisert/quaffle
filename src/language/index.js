const {
    abstract_syntax_tree: py_ast,
    operations: py_opts,
    rule_names: py_rules
} = require("./python")

module.exports.python = {
    abstract_syntax_tree: py_ast,
    operations: py_opts,
    rule_names: py_rules,
    choice_name: "Python"
}
