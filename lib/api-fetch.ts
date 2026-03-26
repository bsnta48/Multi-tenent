import { redirect } from "next/navigation"

let isRefreshing = false
let queue: ((tokenRefreshed: boolean) => void)[] = []

export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  })

  if (res.status !== 401) return res

  // 🔥 FIRST request handles refresh
  if (!isRefreshing) {
    isRefreshing = true

    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })

    isRefreshing = false

    if (!refreshRes.ok) {
      queue.forEach((cb) => cb(false))
      queue = []
      await logout()
    }

    // ✅ notify all queued requests
    queue.forEach((cb) => cb(true))
    queue = []

    // 🔥 IMPORTANT: retry FIRST request
    return fetch(url, {
      ...options,
      credentials: "include",
    })
  }

  // 🔁 queue other requests
  return new Promise<Response>((resolve, reject) => {
    queue.push(async (success) => {
      if (!success) {
        await logout()
      }

      const retry = await fetch(url, {
        ...options,
        credentials: "include",
      })

      resolve(retry)
    })
  })
}

async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}