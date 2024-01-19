FROM node:20.10.0-alpine3.19 as base

RUN apk update && apk add curl bash chromium

FROM base as frontend_builder

ENV PATH="/node_modules/.bin:$PATH"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true


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
