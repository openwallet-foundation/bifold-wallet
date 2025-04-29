# @bifold/verifier

## 2.0.0

### Patch Changes

- 28386ff: Refactor to properly use AgentProvider and enable using multiple configurable themes. This includes changes to the provider tree, screen and component interfaces, a new hook, patches being updated / removed. Three screens that were being reused for distinct purposes were split so they had one use each, with sub components being created for the common content + logic between them to prevent duplicated code.

## 1.0.0

### Major Changes

- 43de99c: first major release of new @bifold packages
