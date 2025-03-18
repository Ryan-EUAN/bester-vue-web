export async function onRequest({ request }) {
    const token = request.headers.get('Authorization');
    if (request.method == 'GET') {
        const res = await fetch('http://123.60.24.41/api/user/profile', {
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
    if (request.method == 'PUT') {
        const body = await request.json();
        const res = await fetch('http://123.60.24.41/api/user/profile', {
            method: request.method,
            headers: {
                Authorization: token,
            },
            body: JSON.stringify(body)
        });
        return new Response(res.body, {
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}