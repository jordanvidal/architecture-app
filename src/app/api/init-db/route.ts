// src/app/api/init-db/route.ts
// ⚠️ SUPPRIMER CETTE ROUTE APRÈS UTILISATION
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    
    // Protection basique
    if (secret !== 'votre-secret-temporaire-12345') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Demo2024!', 10)
    
    // Créer l'utilisateur
    const user = await prisma.user.upsert({
      where: { email: 'marie.dubois@agence.com' },
      update: {},
      create: {
        email: 'marie.dubois@agence.com',
        firstName: 'Marie',
        lastName: 'Dubois',
        password: hashedPassword,
        role: 'AGENCY',
        emailVerified: new Date(),
      },
    })
    
    // Créer les catégories
    const categories = [
      { name: 'Mobilier', colorHex: '#3B82F6', icon: '🪑' },
      { name: 'Luminaire', colorHex: '#10B981', icon: '💡' },
      { name: 'Décoration', colorHex: '#F59E0B', icon: '🖼️' },
      { name: 'Revêtement', colorHex: '#8B5CF6', icon: '🎨' },
      { name: 'Équipement', colorHex: '#EF4444', icon: '🔧' },
    ]
    
    for (const cat of categories) {
      await prisma.prescriptionCategory.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      })
    }
    
    return NextResponse.json({ 
      message: 'Base de données initialisée avec succès! Utilisateur: marie.dubois@agence.com / Mot de passe: Demo2024!'
    })
  } catch (error) {
    console.error('Erreur init DB:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'initialisation' },
      { status: 500 }
    )
  }
}