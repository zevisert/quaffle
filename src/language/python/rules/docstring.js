const { deepsearch } = require("../../../util/deepsearch")


function description(node) {
    return `The ${node.ast_type == "FunctionDef" ? "function" : "class"} ${node.name} has no descriptive docstring`
}

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
            
            return [signature_start, preview_end]
        }
    }
    return [NaN, NaN]
}

function fix(node, preview, tree) {
    return {
        type: 'snippet',
        name: 'docstring',
        message: 'Fill out a docstring',
        required: true,
        fields: [{
            name: 'docstring',
            validate(value, state, item, index) {
                if (item && item.name === 'docstring' && /"""/.test(value)) {
                    return 'Docstring should not contain a closing multiline string'
                }
                return true
            }
        }],

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
        },

        result: (answer) => {
            return answer
        }
    }
}

module.exports.docstring_missing = {
    name: "Missing Docstring",
    description,
    test,
    fix
}
