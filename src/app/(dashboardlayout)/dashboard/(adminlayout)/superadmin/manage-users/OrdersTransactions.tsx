'use client';

import Image from 'next/image';

const orders = [
  {
    name: 'Dianne Russell',
    avatar: '/user1.png',
    invoice: '#6352148',
    item: 'iPhone 14 max',
    qty: 2,
    amount: '$5,000.00',
    status: 'Paid',
  },
  {
    name: 'Wade Warren',
    avatar: '/user2.png',
    invoice: '#6352148',
    item: 'Laptop HPH',
    qty: 3,
    amount: '$1,000.00',
    status: 'Pending',
  },
  {
    name: 'Albert Flores',
    avatar: '/user3.png',
    invoice: '#6352148',
    item: 'Smart Watch',
    qty: 7,
    amount: '$1,000.00',
    status: 'Shipped',
  },
  {
    name: 'Bessie Cooper',
    avatar: '/user4.png',
    invoice: '#6352148',
    item: 'Nike Air Shoe',
    qty: 1,
    amount: '$3,000.00',
    status: 'Canceled',
  },
  {
    name: 'Arlene McCoy',
    avatar: '/user5.png',
    invoice: '#6352148',
    item: 'New Headphone',
    qty: 5,
    amount: '$4,000.00',
    status: 'Canceled',
  },
];

const transactions = [
  { icon: '/payment1.png', name: 'Paytm', desc: 'Starbucks', amount: '-$20' },
  { icon: '/payment2.png', name: 'PayPal', desc: 'Client Payment', amount: '+$800' },
  { icon: '/payment3.png', name: 'Stripe', desc: 'Ordered iPhone 14', amount: '-$300' },
  { icon: '/payment4.png', name: 'Razorpay', desc: 'Refund', amount: '+$500' },
  { icon: '/payment1.png', name: 'Paytm', desc: 'Starbucks', amount: '-$1500' },
  { icon: '/payment3.png', name: 'Stripe', desc: 'Ordered iPhone 14', amount: '+$800' },
];

export default function OrdersTransactions() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm p-4">
      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Recent Orders</h3>
          <button className="text-blue-600 text-xs hover:underline">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="py-2 px-3">Users</th>
                <th className="py-2 px-3">Invoice</th>
                <th className="py-2 px-3">Items</th>
                <th className="py-2 px-3">Qty</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2 px-3 flex items-center gap-2">
                    <Image
                      src={order.avatar}
                      alt={order.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    {order.name}
                  </td>
                  <td className="py-2 px-3">{order.invoice}</td>
                  <td className="py-2 px-3">{order.item}</td>
                  <td className="py-2 px-3">{order.qty}</td>
                  <td className="py-2 px-3">{order.amount}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full
                        ${order.status === 'Paid' ? 'bg-green-100 text-green-600' : ''}
                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : ''}
                        ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : ''}
                        ${order.status === 'Canceled' ? 'bg-red-100 text-red-600' : ''}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Transactions</h3>
          <button className="border text-xs px-2 py-1 rounded">This Month</button>
        </div>

        <div className="space-y-4">
          {transactions.map((t, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src={t.icon} alt={t.name} width={28} height={28} className="rounded" />
                <div>
                  <p className="font-medium text-gray-700 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </div>
              <p
                className={`text-sm font-medium ${t.amount.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}
              >
                {t.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
