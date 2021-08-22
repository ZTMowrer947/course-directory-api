import Koa from 'koa';

const app = new Koa();

app.use((ctx) => {
  ctx.body = {
    message: 'Hello!',
  };
});

app.listen(5000);
