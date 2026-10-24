/* Original bytes go to Storage; the site JSON contains public URLs only. */
globalThis.CaressanoMedia = (() => {
  const bucket = 'caressano-media';
  async function prepare(state, {url, key, token, readCache, writeCache, progress = () => {}}) {
    const inFlight = new Map(), sourceTasks = new Map();
    let count = 0;
    async function upload(src) {
      const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(src);
      if (!match || !/^(image|video)\//.test(match[1]) || match[1] === 'image/svg+xml') {
        throw new Error('Formato de foto o video no compatible. No se publicó ningún cambio.');
      }
      const binary = atob(match[2]);
      const bytes = new Uint8Array(binary.length);
      for (let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
      const path = 'main/' + hash + '-' + match[1].replace(/[^a-z0-9]/gi, '-');
      const publicUrl = url + '/storage/v1/object/public/' + bucket + '/' + path;
      const cacheKey = 'caressanoMedia:' + url + ':' + path;
      if (await readCache(cacheKey) === publicUrl) return publicUrl;
      if (inFlight.has(path)) return inFlight.get(path);
      const task = (async () => {
        progress(++count);
        const response = await fetch(url + '/storage/v1/object/' + bucket + '/' + path, {
          method: 'POST',
          headers: {apikey: key, Authorization: 'Bearer ' + token, 'Content-Type': match[1], 'x-upsert': 'false'},
          body: bytes,
          signal: AbortSignal.timeout(120000)
        });
        if (!response.ok) {
          const detail = await response.text();
          // A previous successful upload may exist after an interrupted publication.
          if (!((response.status === 409 || response.status === 400) && /Duplicate|already exists/i.test(detail))) {
            throw new Error('Carga de foto en Storage (' + response.status + '): ' + detail.slice(0, 500));
          }
        }
        // Never point the site to an inaccessible object, including a private bucket.
        const check = await fetch(publicUrl, {method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(20000)});
        if (!check.ok) throw new Error('La foto no es pública o no se pudo verificar (' + check.status + ').');
        await writeCache(cacheKey, publicUrl);
        return publicUrl;
      })();
      inFlight.set(path, task);
      return task;
    }
    async function visit(value) {
      if (typeof value === 'string') {
        if (!value.startsWith('data:')) return value;
        if (!sourceTasks.has(value)) sourceTasks.set(value, upload(value));
        return sourceTasks.get(value);
      }
      if (Array.isArray(value)) {const out=[]; for (const item of value) out.push(await visit(item)); return out;}
      if (value && typeof value === 'object') {const out={}; for (const [k,v] of Object.entries(value)) out[k]=await visit(v); return out;}
      return value;
    }
    const out = {};
    for (const [k,v] of Object.entries(state)) {
      if (typeof v === 'string' && !v.startsWith('data:')) {
        let parsed;
        try {parsed=JSON.parse(v);} catch {out[k]=v; continue;}
        out[k]=JSON.stringify(await visit(parsed));
      } else out[k]=await visit(v);
    }
    return out;
  }
  return {prepare};
})();
