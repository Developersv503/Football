import { getMyProfile } from './api'
import { getSession } from './session'

export type Viewer = { displayName: string; email: string } | null

// El JWT no lleva displayName — se resuelve con el perfil real. Si el
// token quedó viejo/inválido, se trata como invitado en vez de romper la página.
export async function getViewer(): Promise<{ viewer: Viewer; token: string | null }> {
  const session = await getSession()
  if (!session) return { viewer: null, token: null }

  const viewer = await getMyProfile(session.token)
    .then((profile) => ({ displayName: profile.user.displayName, email: session.user.email }))
    .catch(() => ({ displayName: session.user.email, email: session.user.email }))

  return { viewer, token: session.token }
}
