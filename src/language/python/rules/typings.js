const { match } = require("../../../util/match_parser")
const { ParsingError } = require("../../../util/errors")

function description(node) {
    return `Some arguments of ${node.name} lack typings`
}

function test(node, tree) {
    if (node.ast_type === "FunctionDef" && node.args) {
        const args = node.args.args

        if (args.length > 0 && args.filter(arg => arg.annotation !== null).length !== args.length || node.returns === null) {
            const funcdef_start = node.decorator_list.length > 0
                ? node.decorator_list
                    .map(arg => arg.lineno)
                    .reduce((a, b) => Math.max(a, b)) + 1
                : node.lineno

            const funcdef_end = [
                ...node.args.args,
                node.args.vararg,
                node.args.kwarg,
                ...node.args.kwonlyargs,
                ...node.args.kw_defaults,
                node.returns,
                { lineno: node.lineno }
            ]
            .filter(part => part !== null)
            .map(arg => arg.lineno)
            .reduce((a, b) => Math.max(a, b))

            return [funcdef_start, funcdef_end]
        }
    }
    return [NaN, NaN]
}

function fix(node, preview, tree) {

    return {
        type: "snippet",
        name: 'Typings',
        message: 'Add typings for arguments',
        required: false,
        fields: [],

        /*
         * Builds the prompt template from the { @arg node } and { @arg preview }
         * Python function arguments are quite complex
         */
        template: () => {

            const searchstring = preview.map(s => s.trim()).join(" ")
            let last_arg = undefined
            const args = node.args

            // Keyword argument captures always have ** prepended
            if (args.kwarg)  {
                args.kwarg.arg  = `**${args.kwarg.arg}`
            }

            // Variant arguments always have * prepended, but don't need to 
            // have a variable name assigned
            if (args.vararg !== null) {
                args.vararg.arg = `*${args.vararg.arg}`
            } else if (args.kwonlyargs && args.kwonlyargs.length > 0) {
                args.vararg = {
                    annotation: null,
                    arg: "*",
                    ast_type: "positional_end",
                    col_offset: args.kwonlyargs[0].col_offset - "*,".length,
                    lineno: args.kwonlyargs[0].lineno
                }
            }

            // Make a list of all the parts that go into a function's parameters
            const parts = [
                ...args.args,
                ...args.defaults,
                ...args.kwonlyargs,
                ...args.kw_defaults,
                args.kwarg,
                args.vararg
            ].filter(part => part !== null)

            // Construct the template for the parameters part of the function signature
            const params_templ = parts.length === 0 ? "" : parts
                // Order the available parts by increasing line number and column offset 
                .sort((a, b) => a.lineno === b.lineno ? a.col_offset - b.col_offset : a.lineno - b.lineno)
                // Join the parts with the appropriate separator syntax and templates to fill in missing pieces 
                .reduce((result, part) => {

                    // Arguments and annotations
                    if (part.ast_type === "arg") {
                        last_arg = part.arg
                        let arg = `${part.arg}: \${${part.arg}_type}`
                        if (part.annotation) {
                            const annotation = match.annotation(searchstring, last_arg)
                            arg = `${part.arg}: ${annotation}`
                        }
                        return [result, arg].filter(i => i !== undefined).join(", ")
                    }

                    // Unnamed positional argument end syntax
                    if (part.ast_type === "positional_end") {
                        return [result, part.arg].filter(i => i !== undefined).join(", ")
                    }

                    // To get existing defaults, just read the file, match up to next (or last) arg
                    const defArg = match.defaultarg(searchstring, last_arg)
                    if (defArg === null) {
                        throw new ParsingError(`Unable to determine default value for <${last_arg}> argument`)
                    }
                    return [result, defArg].filter(i => i !== undefined).join("=")

                }, undefined)

            // Construct the template for the return type part of the function signature
            const return_templ = node.returns !== null
                ? match.returntype(searchstring).trim()
                : "\${return_type}"

            return `def ${node.name}(${params_templ}) -> ${return_templ}:`
        },

        /*
         * Formats the resulting template, removing parts that weren't provided
         */
        result: (answer) => {
            for (const [type, value] of Object.entries(answer.values)) {
                if (value === undefined) {
                    if (type !== 'return_type') {
                        const typename = type.slice(0, type.lastIndexOf("_"))
                        answer.result = answer.result.replace(`${typename}: undefined`, typename)
                    } else {
                        answer.result = answer.result.replace(/\s*-> undefined:/, ':')
                    }
                }
            }
            answer.result.concat(["\n"])
            return answer
        }
    }
}

/* 
 * Required exports
 */ 
module.exports.typings_missing = {
    name: "Typings missing",
    description,
    test,
    fix
}
