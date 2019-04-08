const { deepsearch } = require("../../../util/deepsearch")

/*
 * A description of the issue to show with this rule when it matches
 * The { @param node } is a node in the python abstract syntax tree
 */
function description(node) {
    return `The ${node.ast_type == "FunctionDef" ? "function" : "class"} ${node.name} has no descriptive docstring`
}

/* 
 * A test for missing docstrings
 * The { @param node } is a node in the python abstract syntax tree
 * The { @param tree } is the whole python abstract syntax tree
 */
function test (node, tree) {
    if (["FunctionDef", "ClassDef"].includes(node.ast_type)) {
        if (node.body[0].ast_type !== "Expr") {
            const line_nums = {
                args: deepsearch('lineno', node.args),
                body: deepsearch('lineno', node.body),
                returns: deepsearch('lineno', node.returns)
            }
            const signature_start = Math.min(...line_nums.args, node.lineno)
            const signature_end = Math.max(...line_nums.args, ...line_nums.returns, node.lineno)

            const funcdef_end = Math.max(...line_nums.body, node.lineno)
            const preview_end = Math.min(funcdef_end, signature_end + 5)
            
            // Line numbers to load imply a match was found 
            return [signature_start, preview_end]
        }
    }
    // No match, either found a docstring, or isn't a class or function
    return [NaN, NaN]
}

/* 
 * A prompt to fix a missing docstring
 * The { @param node } is a node in the python abstract syntax tree
 * The { @param preview } is a section of the source file where the rule matched
 * The { @param tree } is the whole python abstract syntax tree
 */
function fix(node, preview, tree) {
    return {
        type: 'snippet',
        name: 'docstring',
        message: 'Fill out a docstring',
        required: false,
        fields: [{
            name: 'docstring',
            validate(value, state, item, index) {
                if (item && item.name === 'docstring' && /"""/.test(value)) {
                    return 'Docstring should not contain a closing multiline string'
                }
                return true
            }
        }],

        /*
         * Builds the prompt template from the { @arg node } and { @arg preview }
         */
        template: () => {
            const tabwidth = " ".repeat(node.body[0].col_offset)
            const line_nums = {
                args: deepsearch('lineno', node.args),
                returns: deepsearch('lineno', node.returns)
            }

            const signature_start = Math.min(...line_nums.args, node.lineno)
            const signature_end = Math.max(...line_nums.args, ...line_nums.returns, node.lineno)
            const preview_sig_end = signature_end - signature_start + 1

            return [
                preview.slice(0, preview_sig_end).join("\n"),
                `${tabwidth}"""`,
                `${tabwidth}\${docstring}`,
                `${tabwidth}"""`,
                `${preview.slice(preview_sig_end).join("\n")}`
            ].join("\n")
        }
    }
}


module.exports.docstring_missing = {
    name: "Missing Docstring",
    description,
    test,
    fix
}
