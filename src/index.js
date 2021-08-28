import Koa from 'koa';

import { errorHandler, errorNormalizer } from './middleware/error';
import courseRouter from './routes/course';

const app = new Koa();

app.use(errorHandler);
app.use(errorNormalizer);

app.use(courseRouter.routes());
app.use(courseRouter.allowedMethods());

app.listen(5000);
