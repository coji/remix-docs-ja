// @ts-ignore This file won’t exist if it hasn’t yet been built

export default {
  async fetch(request, env, ctx) {
    return await new Response('Hello!')
  },
} satisfies ExportedHandler<Env>
