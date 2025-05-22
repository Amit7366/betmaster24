export const FAQSection = () => (
  <section className="py-12">
    <div className="container mx-auto">
      <h3 className="text-2xl font-bold text-center mb-4">FREQUENTLY ASKED QUESTIONS</h3>
      <div className="space-y-2">
        {['Who is MachiBet?', 'Why should I join?', 'Is it legal?', 'Is my personal info secure?', 'What are Wallets?'].map((q) => (
          <details key={q} className="bg-white border rounded p-4">
            <summary className="cursor-pointer font-medium">{q}</summary>
            <p className="text-sm text-gray-600 mt-2">This is a placeholder answer for: {q}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
