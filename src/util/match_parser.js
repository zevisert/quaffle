
/*
 * A function using maps to track opening and closing of forms of brackets
 * This is used for extraction of values based on file contents
 * See test/test_signatures for an idea of why this is useful
 * The { @param text } is the text to search within
 * The { @param pattern } is the pattern to start the search from
 * The { @param isdone } is a function to determine if the search is done
 */
function _match({ text="", pattern="", isdone }) {

    const paired = new Map([
        ["{", 0],
        ["(", 0],
        ["[", 0],
        ["'", 0],
        ['"', 0]
    ])

    const matches = text.match(pattern)
    if (matches === null) {
        return null
    }

    const start = matches.length > 0 ? matches[1] : ""

    for (let i = 0; i < start.length; i += 1) {
        const char = start[i]

        // Deal with strings
        switch (char) {
            case "'": {
                // Ignore if in another string
                if (paired.get('"') === 1) continue
                paired.set("'", (paired.get("'") + 1) % 2);
                break;
            }

            case '"': {
                // Ignore if in another string
                if (paired.get("'") === 1) continue
                paired.set('"', (paired.get('"') + 1) % 2);
                break;
            }

            default: break;
        }

        // Deal with brackets
        switch (char) {
            case "{": paired.set("{", paired.get("{") + 1); break
            case "}": paired.set("{", paired.get("{") - 1); break

            case "[": paired.set("[", paired.get("[") + 1); break
            case "]": paired.set("[", paired.get("[") - 1); break

            case "(": paired.set("(", paired.get("(") + 1); break
            case ")": paired.set("(", paired.get("(") - 1); // Special fall though to check if -1 parens
            default: {
                if (isdone(char, paired)) {
                    return start.slice(0, i)
                }
            }
        }
    }

    return null
}

/*
 * Various types of matching algoritms for python
 */
module.exports.match = {
    defaultarg: (text, arg) => {
        return _match({
            text,
            pattern: `${arg}\\s*=\\s*(.*)`,
            isdone: (char, paired) => {
                return false
                || (char == ")" && paired.get("(") === -1 && Array.from(paired.values()).filter(v => v === 0).length === paired.size - 1)
                || (char == "," && Array.from(paired.values()).filter(v => v === 0).length === paired.size)
            }
        })
    },
    annotation: (text, arg) => {
        return _match({
            text,
            pattern: `${arg}\\s*:\\s*(.*)`,
            isdone: (char, paired) => {
                return false
                || (char == ")" && paired.get("(") === -1 && Array.from(paired.values()).filter(v => v === 0).length === paired.size - 1)
                || (char == "," && Array.from(paired.values()).filter(v => v === 0).length === paired.size)
            }
        })
    },
    returntype: (text) => {
        return _match({
            text,
            pattern: `->\\s*(.*)`,
            isdone: (char, paired) => {
                return false
                || (char == ":" && Array.from(paired.values()).filter(v => v === 0).length === paired.size)
            }
        })
    }
}
