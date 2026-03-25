export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  const clientId = context.env.GITHUB_CLIENT_ID;
  const clientSecret = context.env.GITHUB_CLIENT_SECRET;

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return new Response(`OAuth error: ${data.error_description}`, { status: 400 });
    }

    const token = data.access_token;
    const provider = 'github';

    // Send the token back to Decap CMS via postMessage
    const html = `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<script>
(function() {
  function recieveMessage(e) {
    console.log("recieveMessage %o", e);
    window.opener.postMessage(
      'authorization:${provider}:success:{"token":"${token}","provider":"${provider}"}',
      e.origin
    );
    window.removeEventListener("message", recieveMessage, false);
  }
  window.addEventListener("message", recieveMessage, false);
  window.opener.postMessage("authorizing:${provider}", "*");
})();
</script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    return new Response(`Authentication failed: ${error.message}`, { status: 500 });
  }
}
