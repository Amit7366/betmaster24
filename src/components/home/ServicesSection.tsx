export const ServicesSection = () => (
  <section className="py-12 bg-gray-50">
    <div className="container mx-auto grid md:grid-cols-3 gap-6">
      {['DIVERSIFIED GAMES', 'CAPITAL SAFETY', 'PROMOTION AND BONUSES'].map((service) => (
        <div key={service} className="p-6 bg-white rounded shadow text-center">
          <h4 className="font-bold text-lg mb-2">{service}</h4>
          <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </div>
      ))}
    </div>
  </section>
);