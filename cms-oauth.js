export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const CLIENT_ID = env.GITHUB_CLIENT_ID
    const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET

    if (url.pathname === '/auth') {
      return Response.redirect(
        `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user`,
        302
      )
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code')
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code })
      })
      const data = await response.json()
      const token = data.access_token
      const message = `authorization:github:success:{"token":"${token}","provider":"github"}`
      const html = `<!DOCTYPE html><html><body>
        <p style="text-align:center;margin-top:50px;font-family:sans-serif">Connexion en cours...</p>
        <script>
          window.opener.postMessage("authorizing:github","*");
          window.opener.postMessage('${message}',"*");
          setTimeout(()=>window.close(),500);
        </` + `script></body></html>`
      return new Response(html, { headers: { 'Content-Type': 'text/html' } })
    }

    return new Response('Not found', { status: 404 })
  }
}
