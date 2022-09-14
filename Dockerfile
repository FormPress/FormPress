FROM node:16.13.0-alpine3.14 as base

RUN apk update && apk add curl bash

FROM base as frontend_builder

ENV PATH="/node_modules/.bin:$PATH"
ENV REACT_APP_BACKEND='https://app-stage.formpress.org'
ENV REACT_APP_FP_ENV="production"
ENV REACT_APP_GOOGLE_CREDENTIALS_CLIENT_ID="763212824993-o0fl1ru6okjbcltn69sui769ve3cfgtf.apps.googleusercontent.com"
ENV REACT_APP_HOMEURL="https://stage.formpress.org"

ARG PLUGIN_URL
ARG PRIVATE_TOKEN

ADD frontend /frontend

RUN mkdir /scripts
ADD scripts /scripts

RUN cd /scripts && sh ./install_plugin.sh

RUN cd /frontend &&\
  yarn &&\
  yarn build

FROM base as final

RUN set -x \
      && apk update \
      && apk upgrade \
      && apk add --no-cache \
           dumb-init \
           curl \
           make \
           gcc \
           g++ \
           python3 \
           py3-pip \
           linux-headers \
           binutils-gold \
           gnupg \
           libstdc++ \
           nss \
           chromium \
      \
      && apk del --no-cache make gcc g++ python3 py3-pip binutils-gold gnupg libstdc++ \
      && rm -rf /usr/include \
      && rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/* \
      && echo \

ENV SERVER_PORT=3001
ENV FP_ENV=production

ARG PLUGIN_URL
ARG PRIVATE_TOKEN

RUN mkdir /src
RUN mkdir /frontend

COPY --from=frontend_builder /frontend/build /frontend/build
COPY --from=frontend_builder /frontend/src /frontend/src

WORKDIR /src
ADD backend /src

RUN mkdir /scripts
ADD scripts /scripts
RUN cd /scripts && FORMPRESS_HOME="/src" BACKEND_PATH="/" sh ./install_plugin.sh

RUN yarn install

EXPOSE 3001

ENTRYPOINT ["npm", "start"]
