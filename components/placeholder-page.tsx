export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-neutral-500">Halaman ini belum dikerjakan.</p>
    </>
  );
}
