// src/types/file.types.ts

export interface ProjectFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  category: FileCategory
  projectId: string
  spaceId?: string
  space?: {
    id: string
    name: string
  }
  uploadedBy: string
  creator: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  created_at: string
  updated_at: string
}

export enum FileCategory {
  GENERAL = 'GENERAL',
  PLAN_2D = 'PLAN_2D',
  PLAN_3D = 'PLAN_3D',
  PHOTO = 'PHOTO',
  DOCUMENT = 'DOCUMENT',
  DEVIS = 'DEVIS',
  AUTRE = 'AUTRE'
}

export interface FileUploadResponse {
  id: string
  name: string
  url: string
  size: number
  type: string
  category: FileCategory
}

export interface FileFilters {
  category?: FileCategory | 'ALL'
  spaceId?: string | 'ALL'
  searchQuery?: string
}