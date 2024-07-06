import { twc } from 'react-twc'

export const TableOfContents = twc.ul`hidden gap-2 pr-4 pb-8 text-sm leading-4 max-h-[calc(100dvh-48px-32px)] md:flex md:flex-col overflow-y-scroll`
export const TableOfContentsTitle = twc.div`text-muted-foreground font-bold rounded py-1 px-2`
export const TableOfContentsItem = twc.li`ml-4 text-muted-foreground hover:underline`
