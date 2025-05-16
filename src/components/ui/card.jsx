export function Card({ children }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="mt-2 text-sm text-gray-600">{children}</div>;
}
