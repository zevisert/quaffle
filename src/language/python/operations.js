const enquirer = require("enquirer")
const chalk = require("chalk")

const { linerange } = require("../../util/linerange")
const { abstract_syntax_tree } = require("./parse")
const rules = require("./rules")
const { output_patches } = require("../../util/output")

async function operations({ files=[], enabled_rules=[], Prompt=enquirer.prompt, output=console }) {

    const patches = {}
    for (const file of files) {

        const tree = await abstract_syntax_tree({ source: file })

        for (const content of tree.body) {

            for (const rule of Object.values(rules).filter(rule => enabled_rules.includes(rule.name))) {
                const [from, to] = rule.test(content, tree)
                if (Number.isNaN(from)) {
                    continue
                }

                const lines = await linerange({path: file, at: from, until: to})
                const preview = lines.filter(line => line.length > 0)
                
                output.log(`\n${chalk.keyword('orange')(rule.name)} ${chalk.cyan(`[${file}]`)}`)
                output.log(chalk.gray(rule.description(content)))

                try {
                    const answer = await Prompt(rule.fix(content, preview, tree))
                    
                    for (const fix of Object.values(answer)) {
                        if (Object.values(fix.values).some(v => v !== undefined)) {
                            
                            if (patches[file] === undefined) {
                                patches[file] = []
                            }
                            
                            patches[file].push({
                                old: { from, to },
                                new: fix.result,
                                rule: rule.name
                            })
                        }
                    }
                } catch (e) {
                    if (e === "") {
                        // Suspect ctrl-c in prompt to have thrown empty string
                        try {
                            const answer = await Prompt([{
                                type: "confirm",
                                name: "continue",
                                message: "Continue?"
                            }])

                            if (! answer.continue) {
                                await output_patches({ patches, output })
                                process.exit(0)
                            }
                        } catch (e) {
                            process.exit(0)
                        }
                    } else {
                        console.log(e)
                        throw e
                    }
                }
            }
        }
    }
    await output_patches({ patches, output })
}

module.exports.operations = operations
