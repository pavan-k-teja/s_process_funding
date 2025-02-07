import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const allocations = [
  { name: "XO", amount: "$2587k" },
  { name: "IF", amount: "$2332k" },
  { name: "VA", amount: "$2063k" },
  { name: "Nitro", amount: "$1475k" },
  { name: "Nimbletainment", amount: "$1221k" },
  { name: "Electroks", amount: "$950k" },
  { name: "Yeworks", amount: "$918k" },
  { name: "Whisper", amount: "$838k" },
  { name: "ChronoBrotherhood", amount: "$717k" },
];

const generatePersistentColor = (name: string) => {
  const colors = [
    "red", "blue", "green", "yellow",
    "purple", "pink", "indigo", "teal", "orange"
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseColor = colors[hash % colors.length];
  return {
    text: `text-${baseColor}-900`,
    background: `bg-${baseColor}-100`,
    strip: `bg-${baseColor}-500`
  };
};

const Sidebar = () => {
  const [colorMap] = useState(() => {
    const map: { [name: string]: { text: string; background: string; strip: string } } = {};
    allocations.forEach(item => {
      map[item.name] = generatePersistentColor(item.name);
    });
    return map;
  });

  return (
    <aside className="w-64 h-screen bg-gray-100 border-r fixed left-0 top-0 overflow-y-auto">
      <h2 className="text-lg font-semibold p-2">JT'S UNILATERAL ALLOCATION</h2>
      <ScrollArea className="h-full ">
        <div>
          {allocations.map((item, index) => (
            <div key={index} className={`flex items-center h-10 ${colorMap[item.name].background} border-b`}>
              <div className={`w-2 h-full ${colorMap[item.name].strip}`} />
              <div className="flex-1 flex justify-between px-2">
                <span className={`font-medium ${colorMap[item.name].text}`}>{item.name}</span>
                <span className={`font-bold ${colorMap[item.name].text}`}>{item.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
