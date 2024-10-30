import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import url from 'url';
import colors from 'colors';
import connectDB from './config/db.js';
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import postRoute from './routes/postRoute.js';
import commentRoute from './routes/commentRoute.js'
import storyRoute from './routes/storyRoute.js';
import conversationRoute from "./routes/conversationRoute.js"
import messageRoute from './routes/messageRoute.js'
import { errorHandler, notFound } from './middleware/error.js';
import { protect } from './middleware/protect.js';
const port = process.env.PORT;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// connect database
connectDB();

// initialize the app
const app = express();

// Body Parser middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// cookie parser
app.use(cookieParser())

// static files
app.use('/uploads', express.static(path.join(__dirname, "uploads")))

// Routes
app.use('/api/auth/', authRoute);
app.use('/api/user/', protect, userRoute);
app.use('/api/post/', protect, postRoute);
app.use('/api/comment/', protect, commentRoute);
app.use('/api/story/', protect, storyRoute);
app.use('/api/conversation/', protect, conversationRoute);
app.use('/api/message/', protect, messageRoute);

// Error middleware
app.use(notFound)
app.use(errorHandler)


// start the server
app.listen(port, ()=>console.log(`App running on port: ${port}`));