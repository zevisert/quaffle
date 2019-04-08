const {
    abstract_syntax_tree: py_ast,
    operations: py_opts,
    rule_names: py_rules
} = require("./python")

/*
 * These exports define a language that quaffle will prompt for
 */
module.exports.python = {
    abstract_syntax_tree: py_ast,
    operations: py_opts,
    rule_names: py_rules,
    choice_name: "Python"
}
