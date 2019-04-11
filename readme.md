
# Quaffle

An easy-to-use, extensible tool for performing code-changes in the terminal. The main use of Quaffle is to search and prompt for fixes to common software documentation and architecture shortfalls.

## Rationale
*Many* tools already exist for automatically generating documentation ranging from manuals to diagrams, but common to all of these tools is their dependencies on parsing source code - Quaffle is a tool for performing edits to this source code to facilitate this family of automatic software documentation tools. Quaffle focuses on adding optional, often overlooked, annotation to a program's source files that are typically used by documentation generation tools.

## Design Decisions

Quaffle is set-up to be language agnostic, meaning you can search for and apply changes to any programming language. Quaffle is written in JavaScript, but the first supported language is python.

With extensibility as a core requirement, Quaffle is set up to easily integrate new languages. The necessary steps to add support for a new language is to define:

1. A function to parse a file into any form of abstract syntax tree
2. A set of rule functions to check for against the abstract syntax tree
3. A function to generate prompts that allow a user to respond to the selected rules

All three of these responsibilities live in the `src/language/<your_language>` directory. 

### Abstract Syntax Trees
An abstract syntax tree is a term from language parsing, and represents a general method of representing the syntactic structure of a language. All programing languages are based on syntax trees, and thus all programs have an a some sort of syntax tree representation. Quaffle relies on this fact to parse and suggest fixes appropriate to the active language.

### Source code annotations
As mentioned in the [#rationale](#Rationale) section, source code annotations are a common oversight when developing code, but are one of the most useful sources of information for automatically generated documentation. Quaffle is focused on finding and helping the user to fill in the gaps in their source code.

With this first release of quaffle, the python language was first to be implemented. This is largely due to the upcoming [end of life](https://python3statement.org) for python 2.7, with many libraries committed to supporting only python 3 in the near future, more exciting and useful means of source code annotation become available. Features such as type hinting are now standard features in the language.

### Patch files
The unix standard method for representing changes to text-based files. There is a breadth of tools for viewing, applying, and reverting patch files. They are a useful format for staging changes to source files. Patch files have the benefit of being language agnostic, meaning that a patch file can be applied regardless of the underlying programming language of the analysed sources. 

The use of patch files also allows for simpler state management since Quaffle will never write to the files being processed.

### Cross platform architecture
In an effort satisfy a self-imposed availability requirement, Quaffle is developed entirely in Node.js. The Node.js environment is both commonly installed and incredibly easy to set up. The [docs/setup](docs/setup.md) guide covers the requisite steps to install and run quaffle.

### Modularity
Quaffle is designed with modularity in mind. This helps to reduce the cognitive load when working on the source files, and also helps when designing tests for various components of the system.

### Extensibility
Quaffle's modular design also facilitates it's extensibility. New rules and supported languages can be easily added without having to make changes to many disparate source files in the quaffle repository. For instance; to add a new language, one would make a new folder in [`src/language`](src/language), define their parser, rules, and prompts, then register them in [`src/language/index.js`](src/language/index.js). Quaffle will then be able to prompt for processing in the new language then generate patch files.

## Supported Languages and Rules

* Python
    * Missing Docstring
    * Missing type annotations

## Future work
- [ ] Add a function to register 3rd-party languages without having to edit Quaffle sources
- [ ] Inserted definitions validation
- [ ] Automated testing
- [x] Clean up cli to remove co-dependency on specific languages
- [ ] Recursive search for nested rule targets

## Contributing

## Acknowledgements 
* Supporting the work
    * Dr. Neil Ernst, Assistant Professor, University of Victoria
    * Documenting and Understanding Software systems

* Naming the tool
    * The lovely Maegan Bruce, and her vast knowledge of the Harry Potter universe
