import { categories } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const AllProiver = () => {
  return (
    <div className="px-2 sm:px-0 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
          🎮 All Provider
        </h2>
        {/* <Link
                 href="/games"
                 className="text-sm text-gray-300 hover:text-white"
               >
                 View All
               </Link> */}
      </div>
      <div className="flex justify-between gap-3 items-center">
        <Link href="/provider/pragmatic" className="w-3/5 h-[160px] relative min-h-[170px] group shine-effect">
          <Image
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1471"
            alt="Provider"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "160px" }}
            className="absolute top-0 left-0 rounded-xl"
          />
          <h3 className="bg-gradient-to-t from-cyan-600 to-blue-700 rounded-b-xl absolute bottom-0 w-full text-center text-white font-bold py-2 ">Pragmatic</h3>
        </Link>
        <Link href="/provider/jilli" className="w-2/5 h-[160px] relative min-h-[170px] shine-effect">
          <Image
            src="https://www.club99bdt.com/static/img/nextspin.913c157.webp"
            alt="Provider"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "160px" }}
            className="absolute top-0 left-0 rounded-xl"
          />
          <h3 className="bg-gradient-to-t from-cyan-600 to-blue-700 rounded-b-xl absolute bottom-0 w-full text-center text-white font-bold py-2 ">Jilli</h3>
        </Link>
      </div>

      <div className="grid gap-3 grid-cols-3  mt-3">
        {/* <Link href="/provider/jdb" className="rounded-xl relative w-full min-h-[170px] shine-effect">
            <Image
              src="https://www.club99bdt.com/static/img/joker.a95de44.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
             <h3 className="bg-gradient-to-t from-cyan-600 to-blue-700 rounded-b-xl absolute bottom-0 w-full text-center text-white font-bold py-2 ">JDB</h3>
          </Link>
          <Link href="/provider/cq9" className="rounded-xl relative w-full min-h-[170px] shine-effect">
            <Image
              src="https://www.club99bdt.com/static/img/amb.61a8ae3.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
             <h3 className="bg-gradient-to-t from-cyan-600 to-blue-700 rounded-b-xl absolute bottom-0 w-full text-center text-white font-bold py-2 ">CQ9</h3>
          </Link> */}
        {categories.map((cat, index) => (
          <Link href={`/${cat.type}/` + cat.name.toLowerCase()} className="rounded-xl relative w-full min-h-[170px] shine-effect">
            <Image
              // src="https://www.club99bdt.com/static/img/h5kiss.37df68a.webp"
              src={cat?.icon}
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "50px", height: "50px" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl"
            />
            <h3 className="bg-gradient-to-t from-cyan-600 to-blue-700 rounded-b-xl absolute bottom-0 w-full text-center text-white font-bold py-2 ">{cat?.name}</h3>
          </Link>
        ))}

        {/* <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/lfc3.5f9cf6a.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
          <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/ace.5029035.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
          <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/haba.e3b2c23.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div> */}
      </div>
    </div>
  )
}

export default AllProiver
