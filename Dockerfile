FROM node:16.13.0-alpine3.14 as base

RUN apk update && apk add curl bash chromium

FROM base as frontend_builder

ENV PATH="/node_modules/.bin:$PATH"
ENV REACT_APP_BACKEND='https://app-stage.formpress.org'
ENV REACT_APP_FP_ENV="production"
ENV REACT_APP_GOOGLE_CREDENTIALS_CLIENT_ID="763212824993-3qnllbgg3v55sne54gbrdu4d7uvmh42f.apps.googleusercontent.com"
ENV REACT_APP_HOMEURL="https://stage.formpress.org"
ENV REACT_APP_TINYMCE_API_KEY="8919uh992pdzk74njdu67g6onb1vbj8k8r9fqsbn16fjtnx2"
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
