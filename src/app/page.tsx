import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'

export default function Home() {
  // Check if first access — all taxas are 0 and no freelancers
  try {
    const taxasPath = path.join(process.cwd(), 'data', 'rates', 'taxas-regioes.json')
    const freelancersPath = path.join(process.cwd(), 'data', 'dynamic', 'motoristas-freelancer.json')

    const taxas = JSON.parse(fs.readFileSync(taxasPath, 'utf-8'))
    const allZero = Array.isArray(taxas) && taxas.every(
      (z: any) => z.faixas?.every((f: any) => f.precoPorKg === 0)
    )

    let hasFreelancers = false
    if (fs.existsSync(freelancersPath)) {
      const freelancers = JSON.parse(fs.readFileSync(freelancersPath, 'utf-8'))
      hasFreelancers = Array.isArray(freelancers) && freelancers.length > 0
    }

    if (allZero && !hasFreelancers) {
      redirect('/boas-vindas')
    }
  } catch {
    // If error reading files, just go to simulacao
  }

  redirect('/simulacao')
}
