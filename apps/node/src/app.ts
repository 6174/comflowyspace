import express, { Request, Response } from 'express';

export async function startAppServer() {
  console.log("start server sd");
  const app = express();
  const port = 3333;
  
  app.use(express.json());
  
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Express + TypeScript! asdf');
  });
  
  app.post('/api/data', (req: Request, res: Response) => {
    const { data } = req.body;
    res.json({ message: `Received data: ${data}` });
  });
  
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
