FROM node:16

WORKDIR /usr/src/app
COPY ./package.json ./

RUN npm install

COPY ./data data
COPY ./functions functions
COPY ./i18n i18n
COPY ./images images
COPY ./layouts layouts
# COPY ./resources resources
COPY ./config config
COPY ./.eslintignore .eslintignore
COPY ./.eslintrc.json .eslintrc.json
COPY ./.markdownlint-cli2.jsonc .markdownlint-cli2.jsonc
COPY ./.stylelintignore .stylelintignore
COPY ./.stylelintrc.json .stylelintrc.json
COPY ./babel.config.js babel.config.js
COPY ./theme.toml theme.toml

EXPOSE 1313