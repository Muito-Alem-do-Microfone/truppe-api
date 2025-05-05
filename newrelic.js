// newrelic.js
import "dotenv/config"; // já carrega as variáveis do .env

export const config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || "madm-api"],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || "dummy-key",
  logging: {
    level: "info",
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      "request.headers.cookie",
      "request.headers.authorization",
      "request.headers.proxyAuthorization",
      "request.headers.setCookie*",
      "request.headers.x*",
      "response.headers.cookie",
      "response.headers.authorization",
      "response.headers.proxyAuthorization",
      "response.headers.setCookie*",
      "response.headers.x*",
    ],
  },
};
