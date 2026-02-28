---
'@bifold/react-native-attestation': major
'@bifold/react-hooks': major
'@bifold/remote-logs': major
'@bifold/verifier': major
'@bifold/core': major
'@bifold/oca': major
---

Updated all bifold packages for compatibility with credo-ts v0.6.x.
Compatibility with this credo-ts release is important as it has big enhancements across the board,
especially for OpenID related credentials such as mdoc.
This version of credo changes many type and method names, changes which types and methods are available from which exports,
and modifies the interfaces of many existing modules. Thus, changes are made across the project,
some of which may be breaking.
