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
import { useEffect, useState } from "react";
import { getUserInfo } from "@/services/actions/auth.services";
import { getFromLocalStorage } from "@/utils/local-storage";
import { toast } from "sonner";



const pieData = [
  { name: "Male", value: 20000 },
  { name: "Female", value: 25000 },
];

const COLORS = ["#3b82f6", "#f97316"];

interface Transaction {
  transactionType: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface BarData {
  month: string;
  earning: number;
  expense: number;
}

export default function Dashboard() {
  const userInfo = getUserInfo();
  const userId = userInfo?.objectId;
  const token = getFromLocalStorage("accessToken");
  const [barData, setBarData] = useState<BarData[]>([]);
  const [totalEarning, setTotalEarning] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [pieData, setPieData] = useState([
    { name: "Earning", value: 0 },
    { name: "Expense", value: 0 },
  ]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId || !token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/all`,
          { headers: { Authorization: `${token}` } }
        );
        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.message || "Failed to fetch transactions.");
          return;
        }

        const transactions: Transaction[] = data?.data || [];

        // ✅ Filter only successful ones
        const successful = transactions.filter(tx => tx.status === "success");

        // ✅ Initialize totals
        let totalDeposit = 0;
        let totalWithdraw = 0;
        // ✅ Group by month
        const monthlyData: Record<string, { earning: number; expense: number }> = {};

        successful.forEach(tx => {
          const date = new Date(tx.createdAt);
          // const monthName = date.toLocaleString("default", { month: "short" });
          const monthName = date.toISOString().slice(0, 10); // e.g., "2025-11-05"


          if (!monthlyData[monthName]) {
            monthlyData[monthName] = { earning: 0, expense: 0 };
          }

          if (tx.transactionType === "deposit") {
            monthlyData[monthName].earning += tx.amount;
            totalDeposit += tx.amount;
          } else if (tx.transactionType === "withdraw") {
            monthlyData[monthName].expense += tx.amount;
            totalWithdraw += tx.amount;
          }
        });

        // ✅ Convert to array for Recharts
        const formattedData = Object.keys(monthlyData).map(month => ({
          month,
          earning: monthlyData[month].earning,
          expense: monthlyData[month].expense,
        }));

        setBarData(formattedData);
        setTotalEarning(totalDeposit);
        setTotalExpense(totalWithdraw);

        setPieData([
          { name: "Earning", value: totalDeposit },
          { name: "Expense", value: totalWithdraw },
        ]);
      } catch (err) {
        toast.error("Error fetching transactions.");
      }
    };

    fetchTransactions();
  }, [userId, token]);
  return (
    <>
      <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
        <div className="w-full md:w-5/6 bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Revenue Report</h3>
              <button className="border text-xs px-2 py-1 rounded">
                Yearly
              </button>
            </div>
            <p className="text-xs mb-2 text-center">
              <span className="text-blue-600 font-semibold">
                Earning: TK {totalEarning.toLocaleString()}
              </span>{" "}
              |{" "}
              <span className="text-orange-500 font-semibold">
                Expense: TK {totalExpense.toLocaleString()}
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
          {/* <div className="w-full md:w-2/5 grid grid-cols-1 md:grid-cols-2 gap-4 lg:col-span-2">
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
          </div> */}
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              Earning: ${pieData[0].value.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
               Expense: ${pieData[1].value.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* <OrdersTransactions />
      <OrdersDistributionCustomers/> */}
    </>
  );
}
