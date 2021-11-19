# Platypus (codename)

[![Confluence](https://img.shields.io/badge/Confluence-blue)](https://cog.link/devx)
[![API/CLI Docs](https://img.shields.io/badge/API/CLI-Docs-green)](https://cognitedata.github.io/platypus/)
[![Platypus CLI npm](https://badgen.net/npm/v/@cognite/platypus-cli)](https://www.npmjs.com/package/@cognite/platypus-cli)

Our aim is to make it easier for application developer to develop app by reducing cost, friction and learning curve for them. Codename Platypus will help us achieve the same.

## Setup

First, Install Nx with npm:

Make sure the nx is on version 13.x.x!

```
npm install -g nx
```

Then you can install the node_modules by running

```
yarn
```

## Authentication

To be able to login and start using Platypus you will need to authenticate yourself first, we support Azure Active Directory enabled OIDC Login as the latest auth from CDF.

### UI

Visit the staging [URL](http://platypus.staging.cogniteapp.com) and click `Advance Azure options` and enter `cogniteappdev.onmicrosoft.com` as Azure Tenant ID and press **Login with Microsoft Azure** button, after that you will be taken to a page where you need to select **Platypus** as the project and login

### CLI

- [Client Credential (**recommended**)](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow) mode is designed for long lasting token where you will need to provide `client_id` and `client_secret` for your application, this kind of token are long lasting and meant for machine interactions like CI/CD.

  `platypus login --client-secret=<code>`

> You can obtain your personal `client_secret` by visiting [Azure > App registrations > Platypus: greenfield (staging)](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Credentials/appId/4770c0f1-7bb6-43b5-8c37-94f2a9306757/isMSAApp/) and then go to certificate and secrets and generate your new `client_secret`.

- **Legacy Auth** is supported (but not-recomended), to use legacy auth with `API_KEY` please use the following command

  `platypus login [project_name] --api-key=<api_key>`

  alternatively you can also use

  `API_KEY=<api_key> platypus login [project_name]`

  > by default `[project_name]` is set to `platypus`

## NX CLI

NX provides CLI for developing different types of applications and different tools. These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Please read more about how to use the NX CLI here:
https://nx.dev/l/r/getting-started/nx-cli

If you don't want to bother and learn all the commands and you are using VsCode, you can install their extension `Nx Console` and have nice UI from where you can do everything.

### Usefull CLI commands

To run/serve any app, just run:

`nx serve name-of-the-app`

To test any app/library:

`nx test name-of-the-app`

To build the app/library:

`nx build name-of-the-app`

The output can be found in the `dist` folder.

# Platypus App

You can find the code under `apps/platypus`.

To run:

`nx serve platypus`

To build:

`nx build platypus`

To test:

`nx test platypus`

# Platypus CLI

You can find the code under `apps/platypus-cdf-cli`.

To build:

`nx build platypus-cdf-cli`

To test:

`nx test platypus-cdf-cli`

To run:

First build the library, then you can

`yarn platypus --help`
