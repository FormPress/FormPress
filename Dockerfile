FROM node:12.14-alpine3.10 as base

FROM base as frontend_builder

ENV PATH="/node_modules/.bin:$PATH"
ENV REACT_APP_BACKEND='https://stage.formpress.org'
ENV REACT_APP_FP_ENV="production"

ADD frontend /frontend
RUN cd /frontend &&\
  yarn &&\
  yarn build

FROM base as final

ENV SERVER_PORT=3001
ENV FP_ENV=production

RUN mkdir /src
RUN mkdir /frontend

COPY --from=frontend_builder /frontend/build /frontend/build
COPY --from=frontend_builder /frontend/src /frontend/src

WORKDIR /src
ADD backend /src
RUN yarn install

EXPOSE 3001

ENTRYPOINT ["npm", "start"]
