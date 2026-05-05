
"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, History, BarChart2, Settings, LogOut, LayoutGrid, Mic, Radio, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const NOVA_LOGO = "https://images.unsplash.com/photo-1675249168121-160dc199e69e?q=80&w=1000&auto=format&fit=crop";

const navItems = [
  { name: 'الرئيسية', icon: LayoutGrid, href: '/' },
  { name: 'الإحصائيات', icon: BarChart2, href: '/analytics' },
  { name: 'المحادثات', icon: MessageSquare, href: '/' },
  { name: 'الأوامر الصوتية', icon: Mic, href: '/' },
  { name: 'التحكم بالجهاز', icon: Radio, href: '/analytics' },
  { name: 'الإعدادات', icon: Settings, href: '/settings' },
];

export function NovaSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "تم تسجيل الخروج", description: "نشوفك على خير في عالم نوفا." });
      router.push('/login');
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدثت مشكلة أثناء تسجيل الخروج." });
    }
  };

  return (
    <div className="hidden lg:flex flex-col w-[320px] h-screen bg-[#0A090C] border-l border-white/5 p-8 relative z-40" dir="rtl">
      <div className="flex items-center gap-4 mb-16">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8A4DF2] to-[#5F7EFF] flex items-center justify-center nova-glow animate-float overflow-hidden">
          <img src={NOVA_LOGO} alt="Nova Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white nova-text-glow">NOVA AI</h1>
          <span className="text-[10px] text-primary font-black uppercase tracking-widest">المساعد الذكي</span>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="block">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-5 h-16 rounded-[1.2rem] transition-all px-5",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(138,77,242,0.1)]" 
                    : "text-muted-foreground hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground/50")} />
                <span className="font-bold text-[1.05rem]">{item.name}</span>
                {isActive && <div className="mr-auto w-1.5 h-6 bg-primary rounded-full nova-glow" />}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
        {user && (
          <div className="flex items-center gap-4 px-2">
            <Avatar className="w-12 h-12 rounded-2xl border-2 border-primary/20">
              <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">U</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{user.displayName || 'مستكشف نوفا'}</p>
              <div className="flex items-center gap-1 text-[9px] text-green-500 font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> متصل
              </div>
            </div>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-5 text-destructive/70 hover:bg-destructive/10 hover:text-destructive h-16 rounded-2xl font-bold px-6"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </div>
  );
}
