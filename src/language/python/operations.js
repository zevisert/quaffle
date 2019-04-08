const enquirer = require("enquirer")
const chalk = require("chalk")

const { linerange } = require("../../util/linerange")
const { abstract_syntax_tree } = require("./parse")
const rules = require("./rules")
const { output_patches } = require("../../util/output")

/*
 * Defines what to do with the enabled rules for this language domain
 * The { @param files } are those expanded by globbing over the user's input path
 * The { @param enabled_rules } are the rules enabled by the cli prompt
 * The { @param Prompt } allows other frameworks (eg. testing) to override how prompts are created
 */
async function operations({ files=[], enabled_rules=[], Prompt=enquirer.prompt, output=console }) {

    const patches = {}

    // Loop through the provided files
    for (const file of files) {

        // Create the ast for this file
        const tree = await abstract_syntax_tree({ source: file })

        // Loop over the *top-level* statements in this file
        for (const content of tree.body) {

            // Apply the rules to this ast node
            for (const rule of Object.values(rules).filter(rule => enabled_rules.includes(rule.name))) {
                const [from, to] = rule.test(content, tree)
                
                // No preview requested, implies no match
                if (Number.isNaN(from)) {
                    continue
                }

                // Carrying on, load the section of interest
                const lines = await linerange({path: file, at: from, until: to})
                const preview = lines.filter(line => line.length > 0)
                
                // Display the matched rule's name and description
                output.log(`\n${chalk.keyword('orange')(rule.name)} ${chalk.cyan(`[${file}]`)}`)
                output.log(chalk.gray(rule.description(content)))

                try {
                    // Prompt the user to fix the code
                    const answer = await Prompt(rule.fix(content, preview, tree))
                    
                    // Determine if a fix was applied
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
                    // Suspect ctrl-c in prompt to have thrown empty string
                    if (e === "") {
                        // We've quit while creating the fix
                        try {
                            // Shall we skip or actually quit
                            const answer = await Prompt([{
                                type: "confirm",
                                name: "continue",
                                message: "Continue?"
                            }])

                            if (! answer.continue) {
                                // Quitting, output patch of current progress
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
    // Done, output patch file
    await output_patches({ patches, output })
}

module.exports.operations = operations
