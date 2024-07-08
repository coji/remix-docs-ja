import { Link, Outlet } from '@remix-run/react'

export default function JobBoardLayout() {
  return (
    <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr_auto] gap-2 bg-slate-100 dark:bg-slate-900">
      <header className="flex items-center border-b bg-card px-4 py-2 md:container">
        <h2 className="flex-1 text-2xl font-bold">
          <Link to="/job-board">Remix のお仕事あります</Link>
        </h2>
        <Link
          to="/job-board/about"
          className="text-sm text-blue-600 hover:underline"
        >
          このサイトについて
        </Link>
      </header>

      <main className="px-2 md:container">
        <Outlet />
      </main>

      <footer className="border-t bg-card px-4 py-2 text-center">
        Copyright &copy; {new Date().getFullYear()} TechTalk Inc.
      </footer>
    </div>
  )
}
