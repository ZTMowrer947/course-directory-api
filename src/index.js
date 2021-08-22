import Koa from 'koa';

import courseRouter from './routes/course';

const app = new Koa();

app.use(courseRouter.routes());
app.use(courseRouter.allowedMethods());

app.listen(5000);
