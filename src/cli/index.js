const isValidGlob = require("is-valid-glob")
const glob = require("glob")
const chalk = require("chalk")
const enquirer = require("enquirer")

const languages = require("../language")

/*
 * The main entry point to quaffle.
 * Allows tests to override prompt function
 */
async function main({glob_path=null, Prompt=enquirer.prompt}) {

    // No glob path provided, start by prompting the user
    if (!glob_path) {
        try {
            const answer = await Prompt([{
                type: 'input',
                name: 'glob_path',
                message: 'Please provide a file path (or glob_path) to process',
            }])
            glob_path = answer.glob_path
        } catch {
            process.exit(1)
        }
    }
    
    if (!isValidGlob(glob_path)) {
        console.log("Invalid glob path provided")
        process.exit(1)
    }

    const files = glob.sync(glob_path)
    
    try {
        // Prompt to select a language to process
        let answer = await Prompt([{
            type: 'select',
            name: 'language',
            message: 'Which language are you analyzing?',
            initial: 0,
            choices: [
                ...Object.values(languages).map(lang => { return {
                    name: lang.choice_name,
                    message: lang.choice_name
                }}),
                { name: 'other', message: 'Other' }
            ]
        }])

        // Quit if other language selected
        if (answer.language === "other") {
            console.log(chalk.red('Analysis in other languages is a work in progress'))
            process.exit(1)
        } else {
            // Select language rules
            let language = Object.values(languages).find(lang => lang.choice_name = answer.language)

            answer = await Prompt([{
                type: 'multiselect',
                name: 'rules',
                message: 'Which rules would you like to apply?',
                choices: language.rule_names
            }])
            
            // Perform rule checks
            await language.operations({ files, enabled_rules: answer.rules })
        }
    } catch (e) {
        // Ctrl-c while waiting for a prompt throws an uninformative empty string
        // if that's the case, just quit normally
        if (e !== "") console.log(e)
        process.exit(e === "" ? 0 : 1)
    }
}

module.exports.main = main
