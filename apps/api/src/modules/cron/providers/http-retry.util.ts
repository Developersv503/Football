/**
 * Goalserve devuelve 429 real ante requests seguidos (confirmado probando
 * el feed) y Sportradar trial es 1 QPS — ninguno de los dos toleraba el
 * fetch simple sin reintento que había antes. Backoff fijo, 3 intentos.
 */
export async function fetchJsonWithRetry(url: string, maxAttempts = 3): Promise<any> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url)

    if (res.status === 429) {
      lastError = new Error(`${url} -> HTTP 429`)
      await sleep(2000 * attempt)
      continue
    }
    if (!res.ok) {
      throw new Error(`${url} -> HTTP ${res.status}`)
    }
    return res.json()
  }

  throw lastError ?? new Error(`${url} -> falló tras ${maxAttempts} intentos`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
