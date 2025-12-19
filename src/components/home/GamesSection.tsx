export const GamesSection = () => (
  <section className="py-12 bg-gray-100">
    <div className="container mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center">HOT GAMES</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['Cai Shen', 'Mr. Miser', 'Acrobatics', 'Frozen World', 'Money Tree'].map((game) => (
          <div key={game} className="bg-white rounded shadow p-2 text-center">
            <div className="h-32 bg-gray-300 mb-2 rounded"></div>
            <p className="font-medium">{game}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);