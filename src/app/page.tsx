'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkFirstAccess() {
      try {
        const [taxasRes, motRes] = await Promise.all([
          fetch('/api/configuracoes?tipo=taxas'),
          fetch('/api/dinamico?tipo=motoristas'),
        ])
        const taxas = await taxasRes.json()
        const allZero = Array.isArray(taxas) && taxas.every(
          (z: any) => z.faixas?.every((f: any) => f.precoPorKg === 0)
        )
        let hasFreelancers = false
        if (motRes.ok) {
          const motData = await motRes.json()
          hasFreelancers = Array.isArray(motData) && motData.length > 0
        }
        if (allZero && !hasFreelancers) {
          router.replace('/boas-vindas')
        } else {
          router.replace('/simulacao')
        }
      } catch {
        router.replace('/simulacao')
      }
    }
    checkFirstAccess()
  }, [router])

  return null
}
