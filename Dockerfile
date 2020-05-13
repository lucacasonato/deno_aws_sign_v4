 
FROM 'aminnairi/deno'
COPY . app
CMD deno bundle ./app/src/mod.ts