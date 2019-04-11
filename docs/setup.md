
# Requirements

The Quaffle core requires Node.js, and due to the abstract syntax tree generation being offloaded to other languages and parsers, those other languages may require their facilities to be installed as well.

In the current version, language implementations are included in this repository, meaning those languages should also be installed here. *However, you may note that Quaffle is lazy, so you can run it without an operation language in place selection.*

## Binaries
The dependancies of quaffle are:

* `Node.js == 10.13.0`
    * Quaffle core language
* `python == 3.7.1` 
    * For python syntax trees
* `patch == 2.7.6`
    * For applying patch files

## Node Modules
Subject to change, see [package.json](package.json) for most up to date information:

* `enquirer == 2.3.0`,
    * For terminal prompts
* `glob == 7.1.3`,
    * For glob expansion
* `is-valid-glob == 1.0.0`
    * Validation of user-provided glob
* `chalk == 2.4.2`
    * Colouring terminal output
* `diff == 4.0.1`,
    * Creating diffs from prompt results
* `mocha == 6.1.3`
    * Testing framework

# Installation
If you have python and node installed, you should verify the major versions at least match, if so you can skip this step.

```
$ node --version
> v10.13.0
```

```
$ python --version
> Python 3.7.1
```

Otherwise you need to install `node` and `python` somehow. I'd suggest [`conda`](https://docs.conda.io/en/latest/miniconda.html) in this case, since it can install the required versions of both `python` and `node`. 

## With `conda` installed:
```
$ conda create --name quaffle python=3.7.1 nodejs=10.13.0
> ...
$ conda activate quaffle
```

## Another route for `node`: `fnm` (Fast node manager)
```
$ curl https://raw.githubusercontent.com/Schniz/fnm/master/.ci/install.sh | bash
> ...
$ fnm install 10.13.0
> ...
fnm use 10.13.0
> ..
```

## Another route for `python` (Unix only)
```
$ apt install python3.7
> ...
```

## Installing node packages
```
$ npm install # or `npm ci` to replicate my packages exactly
```


# Execution

Use the npm scripts to run quaffle. In the future, it may be published as a package on npm which can be run by name.

```
$ npm start
```
or, specify the target files in the terminal to take advantage of tab-completion
```
$ npm start -- test/test_signatures.py
```

# Testing

Tests can also be run with npm
```
$ npm test
```
Although since `enquirer` and thus this package rely so heavily on the terminal input, testing up until now has not been automated. A testing framework is available, but the proper hooks into `enquirer` for providing keystroke input have not been assembled. Testing can be done by running normally, entering "None", and "A docstring" to solve prompts then `diff`ing the result agaisnt `test/test_signatures.patch`
