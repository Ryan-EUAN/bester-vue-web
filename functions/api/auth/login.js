export async function onRequest({ request }) {
    const body = await request.json();
    const res = await fetch('http://123.60.24.41/api/auth/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(body),
    })

    const data = await res.json();
    return new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
        },
    });
}