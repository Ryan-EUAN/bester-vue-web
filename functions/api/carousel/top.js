export async function onRequest({ request }) {

    const res = await fetch('http://123.60.24.41/api/carousel/top');
    const data = await res.json();

    return new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
        },
    });
}