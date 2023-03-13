FROM node:16 AS docbuilder

WORKDIR /usr/src/app
COPY ./server/package.json ./

RUN npm install

COPY ./server/data data
COPY ./server/functions functions
COPY ./server/i18n i18n
COPY ./server/images images
COPY ./server/layouts layouts
# COPY ./server/resources resources
COPY ./server/config config
COPY ./content content
COPY ./assets assets
COPY ./server/netlify.toml netlify.toml
COPY ./server/.eslintignore .eslintignore
COPY ./server/.eslintrc.json .eslintrc.json
COPY ./server/.markdownlint-cli2.jsonc .markdownlint-cli2.jsonc
COPY ./server/.stylelintignore .stylelintignore
COPY ./server/.stylelintrc.json .stylelintrc.json
COPY ./server/babel.config.js babel.config.js
COPY ./server/theme.toml theme.toml

RUN yarn run build