[![Build Status](https://travis-ci.org/mondora/cycle2work-reports.svg?branch=master)](https://travis-ci.org/mondora/cycle2work-reports)
[![Dependency Status](https://david-dm.org/mondora/cycle2work-reports.svg)](https://david-dm.org/mondora/cycle2work-reports)
[![devDependency Status](https://david-dm.org/mondora/cycle2work-reports/dev-status.svg)](https://david-dm.org/mondora/cycle2work-reports#info=devDependencies)

# cycle2work-reports

AWS Lambda function to process user's co2 saving data to enjoy [`Cycle2work`](https://cycle2work.io).

After cloning the repository, run `npm install` or [`yarn`](https://yarnpkg.com) to install all dependencies.

## Table of Contents

- [Configuration](#folder-structure)
  - [Env Vars](#env-vars)

## Configuration

The lambda can be configured using a [`dotenv`](https://github.com/motdotla/dotenv) file (key=value format).

## Env Vars

Example of `.env` file:

```
MONGODB_URL="mongodb://localhost:27017/test"
LOG_LEVEL=debug
```
