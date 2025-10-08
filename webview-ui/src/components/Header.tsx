export default function Header({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-neutral-200">{title}</h1>
      <p className="text-gray-300 mb-4 p-2">{description}</p>
    </div>
  );
}
