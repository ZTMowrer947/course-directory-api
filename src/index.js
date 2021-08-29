import Koa from 'koa';

import { errorHandler, errorNormalizer } from './middleware/error';
import courseRouter from './routes/course';
import userRouter from './routes/user';

const app = new Koa();

app.use(errorHandler);
app.use(errorNormalizer);

app.use(courseRouter.routes());
app.use(courseRouter.allowedMethods());
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

app.listen(5000);
