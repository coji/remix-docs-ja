import { createTwc } from 'react-twc'

import { cn } from '~/libs/utils'

export const twx = createTwc({ compose: cn })

export const Stack = twx.div`flex flex-col gap-2`
export const HStack = twx.div`flex gap-2 items-center`
