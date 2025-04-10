export async function onRequest({ request }) {
    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete('host');
    const url = new URL(request.url);
    const res = await fetch(`http://http://139.159.243.123/${url.pathname}${url.search}`, {
        method: request.method,
        headers: reqHeaders,
        body: request.body,
    });


    const resHeaders = new Headers(res.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    return new Response(res.body, {
        headers: resHeaders,
    });
}