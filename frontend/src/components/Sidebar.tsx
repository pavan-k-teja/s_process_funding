import { Card } from "@/components/ui/card";

const allocations = [
  { name: "_hold_", amount: 3850, color: "bg-purple-200" },
  { name: "Nitro", amount: 1650, color: "bg-green-300" },
  { name: "Electroks", amount: 1643, color: "bg-pink-500" },
  { name: "ChronoBrotherhood", amount: 1591, color: "bg-gray-300" },
  { name: "Yeworks", amount: 1396, color: "bg-yellow-300" },
];

export default function Sidebar() {
  return (
    <div className="w-1/4 h-full p-4 bg-gray-100">
      <h2 className="text-lg font-semibold">XO's Unilateral Allocation</h2>
      <div className="space-y-2 mt-4">
        {allocations.map((alloc, idx) => (
          <Card key={idx} className={`p-2 ${alloc.color}`}>
            <div className="flex justify-between">
              <span>{alloc.name}</span>
              <span>${alloc.amount}k</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
