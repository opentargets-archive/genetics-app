# Open Targets Genetics App

This repository holds the new [Open Targets Platform](https://www.targetvalidation.org) web app.

It is a Single Page Application built on [React](https://reactjs.org/) using [Apollo GraphQL](https://www.apollographql.com/docs/react/v3.0-beta) for the data fetching and management and the [Material-UI](https://material-ui.com/) component collection.

If you are interested in the backend, you can take a look at the [GraphQL Endpoint Browser](https://api-beta-dot-open-targets-eu-dev.appspot.com/api/v4/graphql/browser) and the [GraphQL Endpoint Schema](https://api-beta-dot-open-targets-eu-dev.appspot.com/api/v4/graphql/browser).

## Required stack

- [NodeJS >= v14](https://nodejs.org/en/)
- [Yarn package manager](https://yarnpkg.com/)

## Running development

This project contains [Genetics](https://genetics.opentargets.org/) web application. To run development mode, you can run: `yarn dev:genetics` in the root directory.

## Building production-ready bundle

From the root directory run: `yarn build:genetics`. This will generate on each application a production-ready bundle.

## Copyright

Copyright 2014-2018 Biogen, Celgene Corporation, EMBL - European Bioinformatics Institute, GlaxoSmithKline, Takeda Pharmaceutical Company and Wellcome Sanger Institute

This software was developed as part of the Open Targets project. For more information please see: http://www.opentargets.org

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
