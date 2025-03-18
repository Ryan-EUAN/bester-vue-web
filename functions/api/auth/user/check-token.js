export async function onRequest({ request }) {
    const token = request.headers.get('Authorization');
    const res = await fetch('http://123.60.24.41/api/auth/user/check-token', {
        method: request.method,
        headers: {
            Authorization: token,
        },
        body: request.body,
    });
    return new Response(res.body, {
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
        },
    });
}