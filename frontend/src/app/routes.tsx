import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import CharacterSearch from '@/pages/CharacterSearch'
import CharacterDetails from '@/pages/CharacterDetails'
import Bazaar from '@/pages/Bazaar'
import Bosses from '@/pages/Bosses'
import Worlds from '@/pages/Worlds'
import Calculator from '@/pages/Calculator'
import Blog from '@/pages/Blog'
import Post from '@/pages/Post'
import Favorites from '@/pages/Favorites'
import ProtectedRoute from '@/components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'characters', element: <CharacterSearch /> },
      { path: 'characters/:name', element: <CharacterDetails /> },
      { path: 'bazaar', element: <Bazaar /> },
      { path: 'bosses', element: <Bosses /> },
      { path: 'worlds', element: <Worlds /> },
      { path: 'calculator', element: <Calculator /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <Post /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'favorites', element: <Favorites /> },
        ],
      },
    ],
  },
])
