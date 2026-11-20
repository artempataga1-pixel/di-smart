"use client";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div className="mx-auto max-w-xl px-6 py-16 text-center" role="alert">
    <h1 className="text-2xl font-semibold">Не удалось загрузить страницу</h1>
    <p className="my-4">Возможно, соединение временно прервалось. Попробуйте ещё раз.</p>
    <button type="button" onClick={retry} className="soft-btn rounded-full px-6 py-3">Повторить</button>
  </div>;
}
