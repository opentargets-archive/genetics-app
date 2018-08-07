# Open Targets Genetics App

This repo contains the web application code for [Open Targets Genetics](https://admiring-dubinsky-cb7f95.netlify.com/).

It is one component of several and the overarching project is described [here](https://github.com/opentargets/genetics), which is also where issues can be raised.

## Installation

Before developing or building for production, you will need to follow these steps:

Clone the repo.

```
git clone https://github.com/opentargets/genetics-app.git
```

Enter the directory.

```
cd genetics-app
```

Install the dependencies.

```
yarn install
```

### Development

Start the dev server.

```
yarn start
```

### Build

Build for production (generates a static `build` directory).

```
yarn build
```

### Deployment

We deploy the public version of this site on [Netlify](https://www.netlify.com/). See the [netlify.toml](netlify.toml) for more detail.

## Contribute

Read our [contributing guidelines](CONTRIBUTING.md).

## License

See our [license](LICENSE) (Apache License, Version 2.0).
