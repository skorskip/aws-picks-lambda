# AWS Picks Lambda

Micro service architecture built for the Picks App.
Each folder represents an individual micro service deployed as lambda using Claudia.js.

## Running Locally
In command line run below command to use local .env file, which each micro service has in its folder.

`export NODE_ENV=local`

## Shared Dependencies
All shared dependencies are contained within the `shared` folder.  This folder is deployed as an npm registry as `picks-app-shared` and referenced in each project.

### Updating version
When making any changes and needing to deploy, first the version needs to be updated.

`npm version <patch|minor|major>`

### Publish Changes
After updating the version, then the changes can be published.

`npm publish`

Once published each folder using the shared dependencies must be updated by running.

`npm i picks-app-shared`
