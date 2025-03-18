// export async function onRequest({ request }) {
//     const body = await request.json();
//     const method = request.method;
//     const token = request.headers.get('Authorization');

//     const res = await fetch('http://123.60.24.41/api/user/profile', {
//         method: request.method,
//         headers: {
//             Authorization: token,
//         },
//         body: request.body,
//     });
//     const data = await res.json();
//     return new Response(JSON.stringify(data), {
//         headers: {
//             'content-type': 'application/json; charset=UTF-8',
//             'Access-Control-Allow-Origin': '*',
//         },
//     });
// }
export async function onRequest({ request }) {
    const token = request.headers.get('Authorization');
    console.log(token);
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