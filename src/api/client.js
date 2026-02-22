import * as SecureStore from 'expo-secure-store'

const SERVER_URL_KEY = 'zlikord.serverUrl'
const TOKEN_KEY = 'zlikord.token'

let _serverUrl = ''
let _token = ''

export async function loadPersistedAuth() {
  _serverUrl = (await SecureStore.getItemAsync(SERVER_URL_KEY)) || ''
  _token = (await SecureStore.getItemAsync(TOKEN_KEY)) || ''
  return { serverUrl: _serverUrl, token: _token }
}

export function getServerUrl() {
  return _serverUrl
}

export function getToken() {
  return _token
}

export async function setServerUrl(url) {
  _serverUrl = url.replace(/\/+$/, '')
  await SecureStore.setItemAsync(SERVER_URL_KEY, _serverUrl)
}

export async function setToken(token) {
  _token = token
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  }
}

export async function clearAuth() {
  _token = ''
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export async function api(path, opts = {}) {
  const { method = 'GET', body, headers: extra = {} } = opts
  const url = `${_serverUrl}/api/v1${path}`

  const headers = { ...extra }
  if (_token) headers['Authorization'] = `Bearer ${_token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = `HTTP ${res.status}`
    try {
      const j = JSON.parse(text)
      if (j.error) msg = j.error
    } catch {}
    throw new Error(msg)
  }

  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return null
}

// WebSocket helper
export function createWS() {
  const proto = _serverUrl.startsWith('https') ? 'wss' : 'ws'
  const host = _serverUrl.replace(/^https?:\/\//, '')
  const url = `${proto}://${host}/api/ws?token=${encodeURIComponent(_token)}`
  return new WebSocket(url)
}
