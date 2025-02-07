import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Menu className="w-6 h-6" />
          <span className="text-lg font-semibold">S-Process Simulator</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="text-white border-white">
            Data Export
          </Button>
          <Button variant="outline" className="text-white border-white">
            Log Out
          </Button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 w-full">
        {/* Left Sidebar */}
        <aside className="w-1/4 bg-gray-100 p-4 border-r">
          <h2 className="text-lg font-semibold mb-2">XO’s Unilateral Allocation</h2>
          <ScrollArea className="h-[calc(100vh-60px)]">
            <Card className="p-3 bg-purple-200 mb-2">_hold_ - $3850k</Card>
            <Card className="p-3 bg-green-300 mb-2">Nitro - $1650k</Card>
            <Card className="p-3 bg-pink-500 text-white mb-2">Electroks - $1643k</Card>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 flex items-center justify-center bg-white">
          <p className="text-gray-500">Main Content Area (Charts, Tree, etc.)</p>
        </main>

        {/* Right Sidebar */}
        <aside className="w-1/4 bg-gray-100 p-4 border-l">
          <h2 className="text-lg font-semibold mb-2">Simulated Budget</h2>
          <ScrollArea className="h-[calc(100vh-60px)]">
            <Card className="p-3 flex justify-between">
              <span>BehemothCorps</span> <span>$0.00</span>
            </Card>
            <Card className="p-3 flex justify-between">
              <span>ChronoBrotherhood</span> <span>$2467k</span>
            </Card>
            <Card className="p-3 flex justify-between">
              <span>Electroks</span> <span>$1231k</span>
            </Card>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}