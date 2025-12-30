"use client";

import { Gift, Info, CalendarClock } from "lucide-react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function RewardsPage() {
  return (
    <section className="min-h-screen bg-primary px-3 pb-24 pt-6 mt-28">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {/* Header Card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                <Gift className="h-5 w-5 text-accent" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  প্রোমোশন বিস্তারিত
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  সাপ্তাহিক নিট লোকসানের ভিত্তিতে কেশব্যাক বোনাস।
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
              <CalendarClock className="h-4 w-4" />
              Weekly Cashback
            </div>
          </div>

          {/* Info bullets */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-[11px] text-white/60">
                <Info className="h-4 w-4" />
                প্রোমোশন শুরু হবে
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                ০২:০০ (GMT+6) on ৮ই নভেম্বর ২০২৪
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-[11px] text-white/60">
                <Info className="h-4 w-4" />
                এটি কিভাবে কাজ করে?
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                সোমবার ০২:০০ থেকে রবিবার ০১:৫৯ পর্যন্ত যেকোনো গেমে বেট।
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-[11px] text-white/60">
                <Info className="h-4 w-4" />
                আপনি কি পাবেন?
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                আপনার সাপ্তাহিক নিট লোকসানের ভিত্তিতে নির্ধারিত কেশব্যাক।
              </p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <p className="text-sm font-semibold text-white">Cashback Table</p>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent ring-1 ring-accent/25">
              VIP Levels
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead className="bg-white/[0.03] text-[11px] font-semibold text-white/70">
                <tr>
                  <th className="px-5 py-3">সাপ্তাহিক নিট লস</th>
                  <th className="px-5 py-3">VIP বেসিক</th>
                  <th className="px-5 py-3">VIP ব্রোঞ্জ</th>
                  <th className="px-5 py-3">VIP সিলভার</th>
                  <th className="px-5 py-3">VIP গোল্ড</th>
                  <th className="px-5 py-3">VIP প্লাটিনাম</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                <tr className="hover:bg-white/[0.03] transition">
                  <td className="px-5 py-4 text-white font-semibold">
                    10,000 – 34,999
                  </td>
                  <td className="px-5 py-4 text-white/85">
                    ৳৭,৭৭৭ - ৳৩৪,৯৯৯
                  </td>
                  <td className="px-5 py-4 text-white/85">৫০০ কয়েন</td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ০.৫%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ১%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ২%
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.03] transition">
                  <td className="px-5 py-4 text-white font-semibold">
                    ৳৩৫,০০০ - ৳৯৯,৯৯৯
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    1%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ০.৫%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ১%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ২%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ৩%
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.03] transition">
                  <td className="px-5 py-4 text-white font-semibold">
                    ৳১,০০,০০০ - ৳৪,৯৯,৯৯৯
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    1.5%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ১.৫%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ২%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ৩%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ৪%
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.03] transition">
                  <td className="px-5 py-4 text-white font-semibold">৳৫,০০,০০০+</td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    2%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ২%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ৩%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ৪%
                  </td>
                  <td className="px-5 py-4 text-emerald-200 font-semibold">
                    ৫%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer hint */}
          <div className="border-t border-white/10 px-5 py-4">
            <p className="text-xs text-white/55">
              * কেশব্যাক নির্ধারণ হবে আপনার সাপ্তাহিক নিট লোকসানের ভিত্তিতে এবং
              ভিআইপি লেভেল অনুযায়ী।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// "use client";

// export default function RewardsPage() {
//   return (
//     <section className="bg-primary text-gray-900 px-4 py-20 sm:px-6 md:px-10 lg:px-20 min-h-screen mt-16">
//       {/* Section Header */}
//       <div className="max-w-3xl mx-auto mb-6">
//         <h2 className="text-lg font-bold text-center text-accent mb-3">
//           প্রোমোশন বিস্তারিত
//         </h2>
//         <ul className="space-y-2 text-sm leading-6 text-textcolor">
//           <li>
//             <strong>প্রোমোশন শুরু হবে:</strong> ০২:০০ (GMT+6) on ৮ই নভেম্বর ২০২৪
//             থেকে।
//           </li>
//           <li>
//             <strong>এটি কিভাবে কাজ করে?</strong>
//             <br />
//             ০২:০০ (GMT+6) সোমবার থেকে ০১:৫৯ (GMT+6) রবিবার পর্যন্ত যেকোনো গেমে
//             বেট রাখুন।
//           </li>
//           <li>
//             <strong>আপনি কি পাবেন?</strong>
//             <br />
//             আপনার সাপ্তাহিক নিট লোকসানের ভিত্তিতে নির্ধারিত কেশব্যাক বোনাস।
//           </li>
//         </ul>
//       </div>

//       {/* Cashback Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full text-center bg-white shadow-md rounded-lg overflow-hidden text-xs sm:text-sm">
//           <thead className="bg-accent text-white">
//             <tr>
//               <th className="p-3">সাপ্তাহিক নিট লস</th>
//               <th className="p-3">VIP বেসিক</th>
//               <th className="p-3">VIP ব্রোঞ্জ</th>
//               <th className="p-3">VIP সিলভার</th>
//               <th className="p-3">VIP গোল্ড</th>
//               <th className="p-3">VIP প্লাটিনাম</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr className="even:bg-secondary odd:bg-primary text-white">
//               <td className="p-3">10,000 – 34,999</td>
//               <td className="p-3">৳৭,৭৭৭ - ৳৩৪,৯৯৯</td>
//               <td className="p-3">৫০০ কয়েন</td>
//               <td className="p-3">০.৫%</td>
//               <td className="p-3">১%</td>
//               <td className="p-3">২%</td>
//             </tr>
//             <tr className="even:bg-secondary odd:bg-primary text-white">
//               <td className="p-3">৳৩৫,০০০ - ৳৯৯,৯৯৯</td>
//               <td className="p-3">1%</td>
//               <td className="p-3">০.৫%</td>
//               <td className="p-3">১%</td>
//               <td className="p-3">২%</td>
//               <td className="p-3">৩%</td>
//             </tr>
//             <tr className="even:bg-secondary odd:bg-primary text-white">
//               <td className="p-3">৳১,০০,০০০ - ৳৪,৯৯,৯৯৯</td>
//               <td className="p-3"> 1.5%</td>
//               <td className="p-3">১.৫%</td>
//               <td className="p-3">২%</td>
//               <td className="p-3">৩%</td>
//               <td className="p-3">৪%</td>
//             </tr>
//             <tr className="even:bg-secondary text-white">
//               <td className="p-3">৳৫,০০,০০০+</td>
//               <td className="p-3"> 2%</td>
//               <td className="p-3">২%</td>
//               <td className="p-3">৩%</td>
//               <td className="p-3">৪%</td>
//               <td className="p-3">৫%</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </section>
//   );
// }
