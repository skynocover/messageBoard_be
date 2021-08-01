import 'dotenv/config';
import morgan from 'morgan';
import express, { Request, Response, NextFunction } from 'express';
import redis from 'redis';
import dayjs from 'dayjs';
import cors from 'cors';

import { Resp } from './resp';

const client = redis.createClient(process.env.REDIS_URL || '');
const PORT = process.env.PORT || 3001;

client.on('error', (error) => {
  console.error(error);
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/version', (req, res) => {
  res.json({ env: process.env.NODE_ENV, version: process.env.VERSION, port: PORT });
});

app.get('/api/messages', async (req, res) => {
  try {
    let offset = req.query.offset || '0';
    if (typeof offset !== 'string') {
      res.json(Resp.paramInputFormateError);
      return;
    }
    if (isNaN(+offset)) {
      res.json(Resp.paramInputFormateError);
      return;
    }

    let limit = req.query.limit || '1000';
    if (typeof limit !== 'string') {
      res.json(Resp.paramInputFormateError);
      return;
    }
    if (isNaN(+limit)) {
      res.json(Resp.paramInputFormateError);
      return;
    }

    const messages = await ListMessage(offset, limit);
    const counts = await GetMessageLen();
    res.json({ messages, counts });
  } catch (error) {
    res.json({ ...Resp.exceptionError, error });
  }
});

app.post('/api/message', async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || typeof message !== 'string') {
      return res.status(400);
    }
    const user = req.body.user;
    if (!user || typeof user !== 'string') {
      return res.status(400);
    }

    let msg = { message, user, time: dayjs().format('YYYY-MM-DD HH:mm:ss') };

    await SetMessage(JSON.stringify(msg));
    res.json(Resp.success);
  } catch (error) {
    res.json({ ...Resp.exceptionError, error });
  }
});

app.delete('/api/message', async (req, res) => {
  try {
    await ClearMessage();
    res.json(Resp.success);
  } catch (error) {
    res.json({ ...Resp.exceptionError, error });
  }
});

app.delete('/api/all', async (req, res) => {
  try {
    await FlushAll();
    res.json(Resp.success);
  } catch (error) {
    res.json({ ...Resp.exceptionError, error });
  }
});

const server = app.listen(PORT, () => {
  console.log(new Date(), `env: ${process.env.NODE_ENV}`);
  console.log(new Date(), `version: ${process.env.VERSION}`);
  console.log(new Date(), `server listening on ${PORT}`);
});

const ListMessage = async (offset: string, limit: string) => {
  return new Promise((resolve, reject) => {
    client.LRANGE('message', +offset, +offset + +limit - 1, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(reply);
    });
  });
};

const SetMessage = async (message: string) => {
  return new Promise((resolve, reject) => {
    client.LPUSH('message', message, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(reply);
    });
  });
};

const GetMessageLen = async () => {
  return new Promise((resolve, reject) => {
    client.llen('message', (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(reply);
    });
  });
};

const ClearMessage = async () => {
  return new Promise(async (resolve, reject) => {
    client.del('message', (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
};

const FlushAll = async () => {
  return new Promise(async (resolve, reject) => {
    client.flushall((err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
};
