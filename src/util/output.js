const Diff = require("diff")
const { linerange } = require("./linerange")

function patchtimestamp(d) {
    const YYYY = d.getFullYear()
    const MM   = d.getMonth()
    const DD   = d.getDay()
    const hh   = d.getHours()
    const mm   = d.getMinutes()
    const ss   = d.getSeconds()
    const tz   = ((d.getTimezoneOffset() / 60) * 100).toFixed()
    
    const width = (v, w) => v.toString().padStart(w, "0")

    return `${YYYY}-${width(MM, 2)}-${width(DD, 2)} ${width(hh, 2)}:${width(mm, 2)}:${width(ss, 2)}.000000000 -${width(tz, 4)}`
}

/*
 * A function to generate patch files based on quaffles snippet edits
 * The { @param patches } is a dict of edits for each file
 * The { @param output } is a console to log output to
 */
async function output_patches({ patches, output=console }) {
    let patchfile = []
    const now = new Date()

    for (const [path, patchlist] of Object.entries(patches)) {

        patchfile.push(`--- ${path}\t${patchtimestamp(now)}`)
        patchfile.push(`+++ ${path}\t${patchtimestamp(now)}`)

        const file_diffs = []

        for (const patch of patchlist) {
            const old_lines = await linerange({ path, at: patch.old.from, until: patch.old.to })
            
            const new_content = patch.new.concat(["\n"])
            const old_content = old_lines.concat([""]).join("\n")

            const diff = Diff.structuredPatch(path, path, old_content, new_content)
            
            diff.hunks = diff.hunks.map(hunk => { return {
                ...hunk,
                oldStart: hunk.oldStart - 1 + patch.old.from,
                newStart: hunk.newStart - 1 + patch.old.from
            }})

            file_diffs.push(...diff.hunks)
        }

        for (const hunk of file_diffs.sort((a, b) => a.oldStart === b.oldStart ? a.oldLines - b.oldLines : a.oldStart - b.oldStart)) {
            patchfile.push(`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`)
            patchfile = patchfile.concat(hunk.lines)
        }
    }

    output.log(patchfile.join("\n"))
}


module.exports.output_patches = output_patches
