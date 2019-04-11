require("mocha")

const assert = require('assert')
const PromptBase = require('enquirer/lib/prompt')
const { main } = require('../src/cli')
const path = require("path")

let prompt;

class Prompt extends PromptBase {
  constructor(options = {}) {
    super({ ...options, show: false });
  }
  render() {}
}

describe("Main", function () {
  describe("list languages", () => {
    it('should prompt for a language to work with'), () => { 
      return main({
        glob_path: path.join(__dirname, "test_signatures.py"),
        prompt: Prompt
      })
    }
  })
})
