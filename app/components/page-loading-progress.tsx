import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useEffect } from 'react'
import { useNavigation } from 'react-router'

export const PageLoadingProgress = () => {
  const navigation = useNavigation()

  useEffect(() => {
    if (navigation.state === 'loading') {
      NProgress.start()
    }

    if (navigation.state === 'idle') {
      NProgress.done()
    }
  }, [navigation.state])
  return null
}
