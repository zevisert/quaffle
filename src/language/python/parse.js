const { promisify } = require("util")
const chalk = require("chalk")

const { exec: exec_native } = require("child_process")
const exec = promisify(exec_native);

/*
 * Offload to a python binary and script to provide the parsing of the python langauge
 * Uses the python `ast` module to build syntax trees
 * The { @param source } is the file to parse
 */ 
async function abstract_syntax_tree({ source }) {
    const ast2json=`${__dirname}/ast2json.py`
    try {
        const { stdout } = await exec(`python ${ast2json} ${source}`)
        return JSON.parse(stdout)
    } catch (e) {
        console.log(chalk.redBright(e.stderr))
        process.exit(e.code)
    }
}

module.exports.abstract_syntax_tree = abstract_syntax_tree
