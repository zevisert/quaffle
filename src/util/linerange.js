const readline = require("readline")
const fs = require("fs")

function outOfRangeError(path, from, to, cursor) {
    return new RangeError(
        `Requested lines from ${from} to ${to} but '${path}' has only ${cursor} lines`
    )
}

module.exports.linerange = function({ path, at, until=undefined }) {
    if (until === undefined) {
        until = at + 1
    }

    return new Promise(function (resolve, reject) {
        if (at < 0 || at % 1 !== 0) {
            return reject(new RangeError(`Invalid line number ${at}`))
        }

        if (at > until) {
            return reject(new RangeError(`Range has negative length`))
        }

        let cursor = 0
        const input = fs.createReadStream(path)
        const rl = readline.createInterface({ input })
        const lines = []

        rl.on('line', (line) => {
            cursor += 1
            if (cursor >= at && cursor <= until) {
                lines.push(line)
            } else if (cursor > until) {
                rl.close()
                input.close()
                resolve(lines)
            }
        })

        rl.on('error', reject)
        input.on('end', () => {
            if (++cursor > until) {
                rl.close()
                input.close()
                resolve(lines)
            } else {
                reject(outOfRangeError(path, at, until, cursor))
            }
        })
    })
}
