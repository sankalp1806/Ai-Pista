import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_ENCRYPTION_KEY = 'test-encryption-key-32-characters'

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Web APIs for PWA tests
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = new Headers(options.headers)
  }
}

global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new Headers(options.headers)
    this.ok = this.status >= 200 && this.status < 300
    this.type = 'basic'
  }
  
  clone() {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    })
  }
  
  async blob() {
    return { size: this.body ? this.body.length : 0 }
  }
  
  async json() {
    return JSON.parse(this.body)
  }
  
  async text() {
    return this.body
  }
}

global.Headers = class Headers {
  constructor(init = {}) {
    this.headers = new Map()
    if (init) {
      if (init instanceof Headers) {
        // Copy from another Headers instance
        init.headers.forEach((value, key) => {
          this.headers.set(key, value)
        })
      } else {
        // Copy from object
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value)
        })
      }
    }
  }
  
  get(name) {
    return this.headers.get(name.toLowerCase()) || null
  }
  
  set(name, value) {
    this.headers.set(name.toLowerCase(), value)
    return this
  }
  
  has(name) {
    return this.headers.has(name.toLowerCase())
  }
  
  delete(name) {
    this.headers.delete(name.toLowerCase())
  }
  
  forEach(callback) {
    this.headers.forEach(callback)
  }
}

// Use the native URL if available, otherwise provide a simple mock
if (typeof globalThis.URL === 'undefined') {
  global.URL = class URL {
    constructor(url, base) {
      this.href = url
      this.protocol = 'https:'
      this.host = 'example.com'
      this.hostname = 'example.com'
      this.port = ''
      this.pathname = '/test'
      this.search = ''
      this.hash = ''
      this.searchParams = {
        delete: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
      }
    }
    
    toString() {
      return this.href
    }
  }
}

// Mock matchMedia (only in jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}