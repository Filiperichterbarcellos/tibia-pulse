import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Tibia Pulse API",
      version: "1.0.0",
      description: "APIs RESTful do Tibia Pulse (backend separado) conforme RFC.",
      contact: {
        name: "Filipe Richter Barcellos",
        url: "https://github.com/Filiperichterbarcellos"
      }
    },
    servers: [
      { url: "http://localhost:3000", description: "Local" }
    ],
  },
  apis: ["./src/routes/*.ts"]
});
