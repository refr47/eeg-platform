import * as express from 'express';
import morgan from 'morgan';
import authRoutes from './server1.js/src1/routes/authRoutes.js';
import usersRoutes from './server1.js/src1/routes/usersRoutes.js';
import customerAccountsRoutes from './server1.js/src1/routes/customerAccountsRoutes.js';
import eegRoutes from './server1.js/src1/routes/eegRoutes.js';
import deviceRoutes from './server1.js/src1/routes/deviceRoutes.js';
import adminRoutes from './server1.js/src1/routes/adminRoutes.js';
import errorHandler$0 from './middlewares/errorHandler';
const { notFoundHandler, errorHandler } = errorHandler$0;

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/customer-accounts', customerAccountsRoutes);
app.use('/eegs', eegRoutes);
app.use('/', deviceRoutes);
app.use('/admin', adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);


export default app;
