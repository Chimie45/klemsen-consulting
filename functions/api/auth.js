export async function onRequest(context) {
  const clientId = context.env.GITHUB_CLIENT_ID;
  const redirectUri = new URL('/api/callback', context.request.url).toString();
  const scope = 'repo,user';

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  return Response.redirect(authUrl, 302);
}
