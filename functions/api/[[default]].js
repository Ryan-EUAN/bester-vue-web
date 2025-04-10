export async function onRequest({ request }) {
    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete('host');
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname.includes('/api')) {
        pathname = pathname.replace('/api', '');
    }
    
    const res = await fetch(`http://139.159.243.123${pathname}${url.search}`, {
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