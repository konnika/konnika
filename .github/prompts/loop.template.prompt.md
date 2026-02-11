# Task Prompt in a Loop

## Instructions for AI Agent
Before starting, ask the user to provide specific values for each of the following placeholders:
- [describe task] - What is the specific task to complete?
- [tests/build command] - What command should be run to test/build?
- [lint command] - What command should be run for linting?
- [functional scenarios] - What functional scenarios should be tested?
- [files] - Which documentation files need to be updated?

Wait for the user's response before proceeding with the task.

## Task
[describe task]

## Definition of Done
- [tests/build command] passes
- [lint command] passes
- [functional scenarios] work: …
- No TODOs left; docs updated: [files]

## Loop protocol
Plan → Execute → Verify → Fix → repeat until all DoD items are satisfied.

## Rules
Don’t claim commands succeeded unless you ran them (or say you can’t). If stuck, ask one precise question or create a minimal repro/test and proceed.