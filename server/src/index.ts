import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middlewares/authMiddleware";
// Route import
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";

// configurations
// Load environment variables from a .env file into process.env
// Useful for keeping secrets like API keys and DB credentials out of your codebase
dotenv.config();

// Initialize an Express application
const app = express();

// Middleware to automatically parse incoming JSON requests into JavaScript objects
app.use(express.json());

// Adds security-related HTTP headers to help protect your app from common vulnerabilities
app.use(helmet());

// Configures Helmet to allow cross-origin resource sharing of resources like images
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// HTTP request logger middleware for logging requests in a standard format (e.g., GET /api/user 200)
app.use(morgan("common"));

// Middleware to parse incoming JSON requests (redundant with express.json(), but sometimes used for older Express setups)
app.use(bodyParser.json());

// Middleware to parse incoming URL-encoded form data (e.g., from HTML forms)
// `extended: false` means it will only parse simple key-value pairs
app.use(bodyParser.urlencoded({ extended: false }));

// Enable Cross-Origin Resource Sharing so your API can be accessed from different domains (e.g., frontend on a different server)
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("This is home route");
});
// tenant
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/tenants", authMiddleware(["manager"]), managerRoutes);

// Server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
