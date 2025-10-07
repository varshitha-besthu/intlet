export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-red-400 text-center">
      <h2 className="font-bold text-xl mb-2">Plan Generation Failed</h2>
      <p className="text-gray-300">{message}</p>
      <p className="text-gray-500 text-sm mt-2">Rephrase your request.</p>
    </div>
  );
}
