// // src/app/contacts/page.tsx
// 'use client'

// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'

// export default function ContactsPage() {
//   const { data: session, status } = useSession()
//   const router = useRouter()

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     )
//   }

//   if (!session) {
//     router.push('/auth/signin')
//     return null
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <header className="bg-white border-b border-slate-200">
//         <div className="max-w-7xl mx-auto px-6 py-6">
//           <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
//           <p className="text-slate-600 mt-1">Gérez vos fournisseurs et revendeurs</p>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
//           <div className="text-slate-400 mb-4">
//             <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//             </svg>
//           </div>
//           <h3 className="text-xl font-semibold text-slate-900 mb-2">
//             Module en développement
//           </h3>
//           <p className="text-slate-600 mb-4">
//             Le module Contacts sera disponible dans la prochaine session !
//           </p>
//           <p className="text-sm text-slate-500">
//             Vous pourrez bientôt gérer vos fournisseurs, revendeurs et marques
//           </p>
//         </div>

//         {/* Preview de ce qui arrive */}
//         <div className="mt-8 grid gap-4 md:grid-cols-3">
//           <div className="bg-white rounded-lg border border-slate-200 p-6">
//             <div className="text-slate-400 mb-3">
//               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//               </svg>
//             </div>
//             <h4 className="font-medium text-slate-900 mb-1">Fournisseurs</h4>
//             <p className="text-sm text-slate-600">
//               Gérez vos contacts fournisseurs directs
//             </p>
//           </div>
          
//           <div className="bg-white rounded-lg border border-slate-200 p-6">
//             <div className="text-slate-400 mb-3">
//               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//             </div>
//             <h4 className="font-medium text-slate-900 mb-1">Revendeurs</h4>
//             <p className="text-sm text-slate-600">
//               Contacts des revendeurs par marque
//             </p>
//           </div>
          
//           <div className="bg-white rounded-lg border border-slate-200 p-6">
//             <div className="text-slate-400 mb-3">
//               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//               </svg>
//             </div>
//             <h4 className="font-medium text-slate-900 mb-1">Marques</h4>
//             <p className="text-sm text-slate-600">
//               Base de données des marques
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }


'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ContactsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600 mt-1">Gérez vos fournisseurs et revendeurs</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Module en développement
          </h3>
          <p className="text-slate-600 mb-4">
            Le module Contacts sera disponible dans la prochaine session !
          </p>
        </div>
      </main>
    </div>
  )
}