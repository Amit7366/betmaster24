import Image from "next/image";

const LICENSE_LOGO = "/logos/local_license_1.png"; // place license logo in public/logos/
const RESPONSIBLE_LOGO = "/logos/be-gamble-aware.png"; // place responsible gaming logo

const PROVIDER_LOGOS = [
  "/logos/providers.png",
];

const PAYMENT_LOGOS = [
  "/logos/bank-transfer.png",
];

const CERT_LOGOS = [
  "/logos/pecb.png",
];

const SAFETY_LOGOS = ["/logos/local_license_1.png"];

export const Footer = () => {
  return (
    <footer className="bg-[#061233] text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* top license row */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image src={LICENSE_LOGO} width={48} height={48} alt="license" />
            <div className="text-sm leading-tight">
              <div className="text-lg font-semibold">গেমিং লাইসেন্স</div>
              <div className="text-xs text-slate-300">safety_license_489594</div>
              <div className="text-xs text-slate-300">retrot-12203694645</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="text-sm text-slate-300">দায়িত্বশীল গেমিং</div>
            <Image
              src={RESPONSIBLE_LOGO}
              width={64}
              height={36}
              alt="responsible"
            />
          </div>
        </div>

        {/* provider logos grid */}
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-6 items-center">
            {PROVIDER_LOGOS.map((p) => (
              <div key={p} className="flex items-center justify-center p-2">
                <Image
                  src={p}
                  width={450}
                  height={48}
                  alt={p}
                  className="w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* payment logos */}
        <div className="mt-10">
          <div className="text-white text-sm font-semibold mb-1">
            পেমেন্ট মেথড
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            {PAYMENT_LOGOS.map((p) => (
              <div key={p} className="h-10 flex items-center">
                <Image
                  src={p}
                  width={175}
                  height={40}
                  alt={p}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* certifications and safety */}
        <div className="mt-10 grid grid-cols-2 gap-6">
          <div>
            <div className="text-white text-lg font-semibold mb-1">
              সার্টিফিকেশন
            </div>
            <div className="flex gap-4 items-center">
              {CERT_LOGOS.map((p) => (
                <div key={p} className="h-12 flex items-center">
                  <Image
                    src={p}
                    width={25}
                    height={48}
                    alt={p}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-white text-lg font-semibold mb-1">সুরক্ষা</div>
            <div className="flex gap-4 items-center">
              {SAFETY_LOGOS.map((p) => (
                <div key={p} className="h-12 flex items-center">
                  <Image
                    src={p}
                    width={60}
                    height={48}
                    alt={p}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

       
      </div>
    </footer>
  );
};
