// src/server.ts
// Configurations de Middlewares
import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './swagger';
import morgan from 'morgan';
import { ONE_HUNDRED, SIXTY } from './core/constants';
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import user from './routes/users-route';
import book from './routes/books-route';
import loan from './routes/loans-route';


const app = express();

// Securisations

// Configurations de securité
app.use(helmet()) //Pour configurer les entete http securisés

app.use(cors({
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization']
})) // Pour gerer le partage des ressources de maniere securisée

// Configuration globaux de l'application express
app.use(express.json()); // parser les requets json
app.use(express.urlencoded({ extended: true })); // parser les requetes url encoder
app.use(compression()); //compression des requetes http
app.use(
	rateLimit({
		max: ONE_HUNDRED,
		windowMs: SIXTY,
		message: 'Trop de Requete à partir de cette adresse IP '
	})
);//limite le nombre de requete
app.use(cookieParser()); //configuration des cookies (JWT)

app.use(morgan('combined'));// Journalisation des requetes au format combined



// Routes du programme
app.use(
	"/users",
	rateLimit({
		max: 20,
		windowMs: 6000,
		handler: (req, res) => {
			res.status(429).json({msg: "Too much request from this address"})
		}
	}),
	user
);

app.use(
	"/books",
	rateLimit({
		max: 20,
		windowMs: 6000,
		handler: (req, res) => {
			res.status(429).json({msg: "Too much request from this address"})
		}
	}),
	book
);

app.use(
	'loans',
	rateLimit({
		max: 20,
		windowMs: 6000,
		handler: (req, res) => {
			res.status(429).json({msg: "Too much request from this address"})
		}
	}),
	loan
);

// Journalisations
app.use(morgan('combined'));

// Documentation
setupSwagger(app);

// Export application to app file
export default app;
