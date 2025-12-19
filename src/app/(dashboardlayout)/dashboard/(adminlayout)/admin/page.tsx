"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import OrdersTransactions from "./manage-users/OrdersTransactions";
import OrdersDistributionCustomers from "./manage-users/OrderDistribution";

const barData = [
  { month: "Jan", earning: 15000, expense: 10000 },
  { month: "Feb", earning: 12000, expense: 11000 },
  { month: "Mar", earning: 20000, expense: 15000 },
  { month: "Apr", earning: 25000, expense: 18000 },
  { month: "May", earning: 45000, expense: 30000 },
  { month: "Jun", earning: 22000, expense: 20000 },
  { month: "Jul", earning: 27000, expense: 12000 },
  { month: "Aug", earning: 14000, expense: 9000 },
  { month: "Sep", earning: 40000, expense: 35000 },
  { month: "Oct", earning: 47000, expense: 36000 },
  { month: "Nov", earning: 21000, expense: 17000 },
  { month: "Dec", earning: 25000, expense: 14000 },
];

const pieData = [
  { name: "Male", value: 20000 },
  { name: "Female", value: 25000 },
];

const COLORS = ["#3b82f6", "#f97316"];

export default function Dashboard() {
  return (
    <>
      <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
        <div className="w-full md:w-5/6 bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="w-full md:w-3/5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Revenue Report</h3>
              <button className="border text-xs px-2 py-1 rounded">
                Yearly
              </button>
            </div>
            <p className="text-xs mb-2">
              <span className="text-blue-600 font-semibold">
                Earning: $500,00,000.00
              </span>{" "}
              |{" "}
              <span className="text-orange-500 font-semibold">
                Expense: $20,000.00
              </span>
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                {/* ✅ Grid lines */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  horizontal={true}
                />

                <XAxis dataKey="month" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip />
                <Bar
                  dataKey="earning"
                  fill="#3b82f6"
                  barSize={5}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  fill="#f97316"
                  barSize={5}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-2/5 grid grid-cols-1 md:grid-cols-2 gap-4 lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 text-blue-600 p-2 rounded">📦</div>
                <div>
                  <p className="text-xs text-gray-500">Total Products</p>
                  <p className="font-semibold text-base">300</p>
                  <p className="text-xs text-green-600 mt-1">
                    Increase by +200 this week
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 text-orange-600 p-2 rounded">
                  👥
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Customer</p>
                  <p className="font-semibold text-base">50,000</p>
                  <p className="text-xs text-red-500 mt-1">
                    Increase by -5k this week
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gray-100 text-gray-800 p-2 rounded">🛒</div>
                <div>
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="font-semibold text-base">1,500</p>
                  <p className="text-xs text-green-600 mt-1">
                    Increase by +1k this week
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-pink-100 text-pink-600 p-2 rounded">💰</div>
                <div>
                  <p className="text-xs text-gray-500">Total Sales</p>
                  <p className="font-semibold text-base">$2500</p>
                  <p className="text-xs text-green-600 mt-1">
                    Increase by +$10k this week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/6 bg-white rounded-xl shadow px-4 py-12">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">
              Customers Statistics
            </h3>
            <button className="border text-xs px-2 py-1 rounded">Yearly</button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={5}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              Male: 20,000
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              Female: 25,000
            </div>
          </div>
        </div>
      </div>

      <OrdersTransactions />
      <OrdersDistributionCustomers/>
    </>
  );
}
