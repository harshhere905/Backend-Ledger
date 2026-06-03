import express from 'express';
import authRoutes from '../src/routes/auth.routes.js'
import accountRoutes from '../src/routes/account.routes.js'
import transactionRoutes from '../src/routes/transaction.routes.js'
import cookieParser from 'cookie-parser'
const app=express();

app.use(express.json());
app.use(cookieParser());
app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Welcome to the API"
    });
});
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/account',accountRoutes);
app.use('/api/v1/transaction',transactionRoutes);
export default app;

