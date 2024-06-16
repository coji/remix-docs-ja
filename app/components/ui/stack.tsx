import { createTwc } from 'react-twc'
import { cn } from '~/libs/utils'

const twx = createTwc({
  compose: cn,
})

export const Stack = twx.div`flex flex-col gap-4`
export const HStack = twx.div`flex gap-4 items-center`
