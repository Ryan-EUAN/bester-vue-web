export async function onRequest({ request }) {
    const body = await request.json();
    const method = request.method;
    const token = request.headers.get('Authorization');
    // const res = await fetch('http://123.60.24.41/api/user/current', {
    //     method: method,
    //     headers: {
    //         'Content-Type': 'application/json; charset=UTF-8',
    //         'Access-Control-Allow-Origin': '*',
    //         'Authorization': token
    //     },
    //     body: JSON.stringify(body)
    // })
    const res = await fetch('http://123.60.24.41/api/user/current', {
        method: request.method,
        headers: request.headers,
        body: request.body,
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
        },
    });
}