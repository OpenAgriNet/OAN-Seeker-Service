<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### About

OAN-Seeker-Service Reference App

OAN Seeker service is middleware for calling the protocol transaction api and caching the search content in cache db to store and refresh the content on daily basis using corn job. 

Steps to install this app.

1. Git clone https://github.com/tekdi/OAN-Seeker-Service

2. cd OAN-Seeker-Service

3. npm install

4. npm run start

5. run http://localhost:3000 on your browser to test the app is running

6. Add .env file in this format

        PORT=3000
        HASURA_URL= {{base_url}}/v1/graphql
        HASURA_GRAPHQL_ADMIN_SECRET= "<HASURA_GRAPHQL_ADMIN_SECRET>"
        DB_TYPE=postgres
        DB_HOST=localhost
        DB_PORT=5432
        DB_USERNAME=hasura
        DB_PASSWORD=hasura
        DB_NAME=hasura_db
        CACHE_DB="scheme_cache_data"
        REDIS_HOST=localhost
        REDIS_PORT=6379
        API_KEY=<WEATHERMAP_API_KEY>
        GEO_URL=http://api.openweathermap.org/geo/1.0/direct

        DOMAIN="schemes:oan"
        BAP_CLIENT_URL="<BAP_CLIENT_URL>"
        BAP_ID="<BAP_ID>"
        BAP_URI="<BAP_URI>"
        BPP_ID="<BPP_ID>"
        BPP_URI="<BPP_ID>"

7. Restart the server: npm run start

Postman Documentation:

link: https://grey-escape-31127.postman.co/documentation/18319029-f20a4c89-0dba-45c8-9cc3-0b5b8799fcee/publish?workspaceId=13fbe18d-7c0e-4245-bf2f-0fa5d5758b3a
