'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from 'recharts';
import Image from 'next/image';

const lineData = [
  { name: 'Jan', value: 2000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2500 },
  { name: 'Apr', value: 4000 },
  { name: 'May', value: 7000 },
  { name: 'Jun', value: 5000 },
  { name: 'Jul', value: 6000 },
  { name: 'Aug', value: 5500 },
  { name: 'Sep', value: 4800 },
];

const countries = [
  { flag: '/flags/us.svg', name: 'USA', users: 1240, color: 'bg-blue-500', percent: 80 },
  { flag: '/flags/jp.svg', name: 'Japan', users: 1240, color: 'bg-orange-400', percent: 60 },
  { flag: '/flags/fr.svg', name: 'France', users: 1240, color: 'bg-orange-200', percent: 49 },
  { flag: '/flags/de.svg', name: 'Germany', users: 1240, color: 'bg-green-500', percent: 100 },
];

const customers = [
  { name: 'Dianne Russell', phone: '017********58', avatar: '/user1.png', orders: 30 },
  { name: 'Wade Warren', phone: '017********58', avatar: '/user2.png', orders: 30 },
  { name: 'Albert Flores', phone: '017********58', avatar: '/user3.png', orders: 35 },
  { name: 'Bessie Cooper', phone: '017********58', avatar: '/user4.png', orders: 20 },
  { name: 'Arlene McCoy', phone: '017********58', avatar: '/user5.png', orders: 25 },
  { name: 'John Doe', phone: '017********58', avatar: '/user6.png', orders: 32 },
];

export default function OrdersDistributionCustomers() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm p-4">
      {/* Line Chart Section */}
      <div className="bg-white rounded-xl shadow p-4">
        <p className="font-semibold text-gray-800 mb-2">Recent Orders</p>
        <div className="text-2xl font-bold text-gray-800">$27,200</div>
        <p className="text-xs mt-1 flex items-center gap-2">
          <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-medium">
            10%
          </span>
          Increases
        </p>
        <ResponsiveContainer width="100%" height={160}>
         <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={10} stroke="#999" />
            <YAxis fontSize={10} stroke="#999" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="#ede9fe"
            />
            <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#c4b5fd" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Map (Mock) */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between mb-2">
          <p className="font-semibold text-gray-800">Distribution Maps</p>
          <button className="border text-xs px-2 py-1 rounded">Yearly</button>
        </div>
        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
          (Map Placeholder)
        </div>
        <div className="mt-4 space-y-3">
          {countries.map((c, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Image src={c.flag} alt={c.name} width={20} height={14} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {c.name} <span className="text-xs text-gray-400">- {c.users} Users</span>
                </p>
                <div className="w-full bg-gray-200 h-1 rounded">
                  <div
                    className={`${c.color} h-1 rounded`}
                    style={{ width: `${c.percent}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500">{c.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between mb-3">
          <p className="font-semibold text-gray-800">Top Customers</p>
          <button className="text-blue-600 text-xs hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {customers.map((user, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.phone}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Orders: {user.orders}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
