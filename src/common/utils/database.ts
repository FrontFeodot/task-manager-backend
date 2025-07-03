import { connect } from 'mongoose';

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const mongoConnect = (callback: () => void) => {
  if (MONGO_URI) {
    return connect(MONGO_URI)
      .then((_) => {
        console.log('Connected!');
        callback();
      })
      .catch((err) => {
        console.error('mongo connect error', err);
      });
  }
  console.error('connect not succeed');
};

export default mongoConnect;
