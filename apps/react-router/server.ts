export default {
  async fetch() {
    return await new Response('{}')
  },
} satisfies ExportedHandler<Env>
