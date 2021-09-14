import cors from 'kcors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';

import { errorHandler, errorNormalizer } from './middleware/error';
import courseRouter from './routes/course';
import userRouter from './routes/user';

const app = new Koa();

// App-wide middleware
app.use(errorHandler);
app.use(errorNormalizer);
app.use(conditional());
app.use(etag());
app.use(
  cors({
    credentials: true,
    origin: '*',
    exposeHeaders: ['Location'],
  })
);
app.use(bodyParser());

// Routing
app.use(courseRouter.routes());
app.use(courseRouter.allowedMethods());
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

app.listen(5000, () => {
  console.log('course-directory-api now running on port 5000');
});
