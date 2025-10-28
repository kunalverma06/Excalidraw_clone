FROM node:22-alpine

WORKDIR /app


RUN npm install -g pnpm

# Copy all source code
COPY . .

RUN pnpm install


EXPOSE 3001  9000 8080

CMD [ "pnpm" , "run" , "dev" ]

