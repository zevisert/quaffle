const isValidGlob = require("is-valid-glob")
const glob = require("glob")
const chalk = require("chalk")
const enquirer = require("enquirer")

const { python } = require("../language")

async function main({glob_path=null, Prompt=enquirer.prompt}) {

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
        let answers = await Prompt([{
            type: 'select',
            name: 'language',
            message: 'Which language are you analyzing?',
            initial: 0,
            choices: [
                { name: 'python', message: 'Python' },
                { name: 'other', message: 'Other' }
            ]
        }])

        switch (answers.language) {
            case "python": {
                    answers = await Prompt([{
                        type: 'multiselect',
                        name: 'rules',
                        message: 'Which rules would you like to apply?',
                        choices: python.rule_names
                    }])
                    
                    await python.operations({ files, enabled_rules: answers.rules })
                    break;
            }
            case "other":
            default: {
                console.log(chalk.red('Analysis in other languages is a work in progress'))
                process.exit(1)
            }
        }
    } catch (e) {
        // Ctrl-c while waiting for a prompt throws an uninformative empty string
        // if that's the case, just quit normally
        process.exit( e === "" ? 0 : 1)
    }
}

module.exports.main = main
