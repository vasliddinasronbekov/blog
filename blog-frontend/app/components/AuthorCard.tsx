
export default function AuthorCard({ name }: { name?: string;}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold">
        {name ? name[0].toUpperCase() : 'U'}
      </div>
      <div>
        <div className="font-medium">{name || 'Muallif'}</div>
        <div className="text-sm muted">Contributor</div>
      </div>
    </div>
  );
}
