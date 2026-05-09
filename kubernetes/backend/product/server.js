import express from 'express';
import axios from 'axios';
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));

app.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://main-server-service/');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
app.get('/products', async (req, res) => {
    try {
        const response = await axios.get('http://main-server-service/');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});


app.listen(3001, () => {
  console.log('Product service is running on port 3001');
});