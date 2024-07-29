import { CorsOptions } from "cors";

const allowedOrigins = ["http://localhost:3000"];

const isOriginAllowed = (origin: string | undefined): boolean =>
  origin !== undefined && allowedOrigins.includes(origin);

const corsOptions: CorsOptions = {
  methods: ["POST", "GET", "PATCH"],
  exposedHeaders: "Authorization",
  origin: (origin, callback) => {
    if (origin === undefined || isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

export { corsOptions };
