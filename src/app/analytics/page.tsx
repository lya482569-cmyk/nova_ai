
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NovaSidebar } from "@/components/navigation/sidebar";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";
import { Cpu, MessageSquare, Mic, Activity, Clock, LayoutGrid, Bell, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { collection, query } from "firebase/firestore";
import { useRouter } from "next/navigation";

const NOVA_LOGO = "https://images.unsplash.com/photo-1675249168121-160dc199e69e?q=80&w=1000&auto=format&fit=crop";

const activityData = [
  { time: "00:00", value: 10 },
  { time: "04:00", value: 5 },
  { time: "08:00", value: 30 },
  { time: "12:00", value: 70 },
  { time: "16:00", value: 50 },
  { time: "20:00", value: 90 },
  { time: "24:00", value: 20 },
];

export default function AnalyticsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  // جلب الرسائل الحقيقية لحساب عددها
  const messagesQuery = user && db ? query(
    collection(db, 'users', user.uid, 'chats', 'default', 'messages')
  ) : null;
  const { data: messages = [] } = useCollection<any>(messagesQuery);

  const stats = [
    { label: "المحادثات النشطة", value: "1", trend: "مستقر", icon: MessageSquare, color: "text-blue-400" },
    { label: "الأوامر المنفذة", value: messages.length.toString(), trend: "مباشر", icon: Mic, color: "text-teal-400" },
    { label: "إجمالي الرسائل", value: messages.length.toString(), trend: "واقعي", icon: Clock, color: "text-primary" },
    { label: "حالة النظام", value: "متصل", trend: "ممتاز", icon: LayoutGrid, color: "text-purple-400" },
  ];

  const handleDeviceAction = (action: string) => {
    toast({
      title: "تم استلام الأمر",
      description: `جاري تنفيذ: ${action} عبر الرابط العصبي...`,
    });
  };

  return (
    <div className="flex h-screen bg-[#050406] overflow-hidden font-arabic" dir="rtl">
      <NovaSidebar />

      <main className="flex-1 flex flex-col overflow-auto relative">
        <header className="h-24 flex items-center justify-between px-8 bg-[#050406]/60 backdrop-blur-xl border-b border-white/[0.05] sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full ultra-glass w-14 h-14 text-white hover:bg-white/10"
              onClick={() => router.push('/')}
            >
              <ArrowRight className="w-8 h-8" />
            </Button>
            <div>
              <h2 className="text-2xl font-black text-white nova-text-glow">الإحصائيات الحقيقية</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">تتبع النشاط الفعلي</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border border-white/10 rounded-2xl">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-primary/20 text-primary font-black">U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <Card key={i} className="ultra-glass border-white/5 rounded-[2rem] overflow-hidden group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={cn("p-3 rounded-2xl ultra-glass", s.color)}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">
                      {s.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold mb-1">{s.label}</p>
                    <h4 className="text-2xl font-black text-white">{s.value}</h4>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Chart */}
          <Card className="ultra-glass border-white/5 rounded-[2.5rem] p-4">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div>
                <CardTitle className="text-xl font-black text-white">النشاط اليومي</CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground mt-1">تتبع التفاعل المباشر مع نوفا</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#888888', fontWeight: 'bold' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121214', border: '1px solid #ffffff10', borderRadius: '16px' }}
                    itemStyle={{ color: '#8A4DF2', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="ultra-glass border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-xl font-black text-white">التحكم العصبي</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'خفض الصوت', icon: Mic },
                  { label: 'رفع الصوت', icon: Activity },
                  { label: 'فتح تطبيق', icon: LayoutGrid },
                  { label: 'كتم الصوت', icon: Bell },
                ].map((c, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    className="h-20 ultra-glass border-white/5 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-all"
                    onClick={() => handleDeviceAction(c.label)}
                  >
                    <c.icon className="w-6 h-6 text-primary" />
                    <span className="text-[10px] font-bold">{c.label}</span>
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="ultra-glass border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative w-32 h-32 rounded-full border-4 border-primary/40 flex items-center justify-center nova-glow">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <img src={NOVA_LOGO} alt="Nova" className="w-12 h-12 rounded-lg object-cover" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-xl font-black text-white">نوفا تستمع...</h4>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Neural Link Active</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
