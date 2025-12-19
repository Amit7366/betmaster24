"use client";

export default function RewardsPage() {
  return (
    <section className="bg-primary text-gray-900 px-4 py-20 sm:px-6 md:px-10 lg:px-20 min-h-screen">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <h2 className="text-lg font-bold text-center text-accent mb-3">
          প্রোমোশন বিস্তারিত
        </h2>
        <ul className="space-y-2 text-sm leading-6 text-textcolor">
          <li>
            <strong>প্রোমোশন শুরু হবে:</strong> ০২:০০ (GMT+6) on ৮ই নভেম্বর ২০২৪
            থেকে।
          </li>
          <li>
            <strong>এটি কিভাবে কাজ করে?</strong>
            <br />
            ০২:০০ (GMT+6) সোমবার থেকে ০১:৫৯ (GMT+6) রবিবার পর্যন্ত যেকোনো গেমে
            বেট রাখুন।
          </li>
          <li>
            <strong>আপনি কি পাবেন?</strong>
            <br />
            আপনার সাপ্তাহিক নিট লোকসানের ভিত্তিতে নির্ধারিত কেশব্যাক বোনাস।
          </li>
        </ul>
      </div>

      {/* Cashback Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-center bg-white shadow-md rounded-lg overflow-hidden text-xs sm:text-sm">
          <thead className="bg-accent text-white">
            <tr>
              <th className="p-3">সাপ্তাহিক নিট লস</th>
              <th className="p-3">VIP বেসিক</th>
              <th className="p-3">VIP ব্রোঞ্জ</th>
              <th className="p-3">VIP সিলভার</th>
              <th className="p-3">VIP গোল্ড</th>
              <th className="p-3">VIP প্লাটিনাম</th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-secondary odd:bg-primary text-white">
              <td className="p-3">10,000 – 34,999</td>
              <td className="p-3">৳৭,৭৭৭ - ৳৩৪,৯৯৯</td>
              <td className="p-3">৫০০ কয়েন</td>
              <td className="p-3">০.৫%</td>
              <td className="p-3">১%</td>
              <td className="p-3">২%</td>
            </tr>
            <tr className="even:bg-secondary odd:bg-primary text-white">
              <td className="p-3">৳৩৫,০০০ - ৳৯৯,৯৯৯</td>
              <td className="p-3">1%</td>
              <td className="p-3">০.৫%</td>
              <td className="p-3">১%</td>
              <td className="p-3">২%</td>
              <td className="p-3">৩%</td>
            </tr>
            <tr className="even:bg-secondary odd:bg-primary text-white">
              <td className="p-3">৳১,০০,০০০ - ৳৪,৯৯,৯৯৯</td>
              <td className="p-3"> 1.5%</td>
              <td className="p-3">১.৫%</td>
              <td className="p-3">২%</td>
              <td className="p-3">৩%</td>
              <td className="p-3">৪%</td>
            </tr>
            <tr className="even:bg-secondary text-white">
              <td className="p-3">৳৫,০০,০০০+</td>
              <td className="p-3"> 2%</td>
              <td className="p-3">২%</td>
              <td className="p-3">৩%</td>
              <td className="p-3">৪%</td>
              <td className="p-3">৫%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
