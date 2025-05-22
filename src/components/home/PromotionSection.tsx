export const PromotionSection = () => (
  <section className="py-12">
    <div className="container mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center">PROMOTION</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-yellow-100 rounded shadow p-4 text-center">
            <div className="h-24 bg-gray-200 rounded mb-2"></div>
            <p className="font-medium">Promo {i}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
