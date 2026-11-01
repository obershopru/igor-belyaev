import Link from "next/link"

export function BlogHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-5 md:px-10">
      <Link href="/" className="text-sm font-black uppercase tracking-[0.2em] text-zinc-200 transition-colors hover:text-yellow-400">
        Игорь Беляев
      </Link>
      <nav className="flex items-center gap-5 text-sm font-bold text-zinc-400" aria-label="Разделы сайта">
        <Link href="/blog" className="transition-colors hover:text-yellow-400">Блог</Link>
        <Link href="/master" className="transition-colors hover:text-yellow-400">Мастер-класс</Link>
      </nav>
    </header>
  )
}

export function BlogFooter() {
  return (
    <footer className="flex flex-col gap-4 px-5 py-8 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between md:px-10">
      <span className="font-black uppercase tracking-[0.2em] text-zinc-300">Игорь Беляев</span>
      <nav className="flex flex-col gap-2 md:flex-row md:gap-5" aria-label="Юридические документы">
        <a href="https://drive.google.com/file/d/18mjLhJ1Pk6L_Lg8o-heN4RLQOUA5L9-c/view" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-yellow-400">Политика обработки персональных данных</a>
        <a href="https://drive.google.com/file/d/1Az6vBCjpC2lnrKxvCkRIk8vtGkqKZv9C/view" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-yellow-400">Согласие на обработку персональных данных</a>
      </nav>
      <span>© {new Date().getFullYear()} Все права защищены</span>
    </footer>
  )
}
