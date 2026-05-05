
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { NovaSidebar } from '@/components/navigation/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Languages, Volume2, Save, ArrowRight, Palette, BellRing, Monitor, ShieldCheck, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { data: profile, loading: profileLoading } = useDoc(user && db ? doc(db, 'users', user.uid) : null);
  
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'ar',
    autoSpeak: false,
    voiceName: 'default'
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.preferences) {
      setSettings(prev => ({ ...prev, ...profile.preferences }));
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        preferences: settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // تطبيق الثيم فورياً
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
      }

      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث تفضيلاتك في السحابة وتطبيقها الآن.",
      });

    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "فشل الحفظ", 
        description: "حدث خطأ أثناء محاولة حفظ الإعدادات. يرجى المحاولة لاحقاً." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050406]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050406] overflow-hidden font-arabic" dir="rtl">
      <NovaSidebar />

      <main className="flex-1 flex flex-col overflow-auto relative bg-gradient-to-b from-transparent to-primary/5">
        <header className="h-24 flex items-center justify-between px-10 bg-[#050406]/80 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/[0.05]">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full ultra-glass w-14 h-14 text-white hover:bg-white/10 transition-all active:scale-95"
              onClick={() => router.push('/')}
            >
              <ArrowRight className="w-8 h-8" />
            </Button>
            <div>
              <h2 className="font-black text-3xl text-white nova-text-glow">الإعدادات الذكية</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">تخصيص الرابط العصبي Nova</p>
            </div>
          </div>
          <Button 
            className="h-16 px-10 rounded-2xl nova-gradient text-white font-black shadow-[0_0_30px_rgba(138,77,242,0.4)] hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-3"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-6 h-6" />}
            <span>حفظ التغييرات</span>
          </Button>
        </header>

        <div className="p-10 max-w-6xl mx-auto w-full space-y-10 pb-32">
          {/* User Hero Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <Card className="relative ultra-glass border-white/5 rounded-[3rem] overflow-hidden">
              <CardContent className="p-12 flex flex-col md:flex-row items-center gap-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center text-white text-6xl font-black shadow-2xl nova-glow animate-float">
                    {user?.displayName?.[0] || 'U'}
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-green-500 w-8 h-8 rounded-full border-4 border-[#050406] animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-right space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-black text-white">{user?.displayName || 'مستكشف نوفا'}</h3>
                    <p className="text-xl text-muted-foreground font-medium">{user?.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black rounded-xl border border-primary/20">
                      <ShieldCheck className="w-4 h-4" />
                      حساب مفعل عصبياً
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary text-xs font-black rounded-xl border border-secondary/20">
                      <Sparkles className="w-4 h-4" />
                      عضوية بريميوم
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Visual Customization Card */}
            <Card className="ultra-glass border-white/5 rounded-[3rem] p-4 flex flex-col">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black flex items-center gap-4 text-white">
                  <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                    <Palette className="w-7 h-7" />
                  </div>
                  التخصيص البصري
                </CardTitle>
                <CardDescription className="text-muted-foreground/60">تحكم في هوية Nova البصرية بما يناسب ذوقك.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 p-8 pt-0 flex-1">
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase text-muted-foreground tracking-widest block mb-4">اختر المظهر العام</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', icon: Sun, label: 'نهاري' },
                      { id: 'dark', icon: Moon, label: 'ليلي' },
                      { id: 'system', icon: Monitor, label: 'تلقائي' }
                    ].map((t) => (
                      <button 
                        key={t.id}
                        className={cn(
                          "h-28 flex flex-col items-center justify-center gap-3 rounded-[2rem] border transition-all duration-300",
                          settings.theme === t.id 
                            ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(138,77,242,0.2)] text-white" 
                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                        )}
                        onClick={() => setSettings(s => ({...s, theme: t.id}))}
                      >
                        <t.icon className={cn("w-7 h-7", settings.theme === t.id ? "text-primary" : "")} />
                        <span className="text-xs font-black">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                  <div className="space-y-1">
                    <Label className="text-lg font-black text-white flex items-center gap-3">
                      <Languages className="w-5 h-5 text-primary" />
                      لغة المساعد
                    </Label>
                    <p className="text-xs text-muted-foreground">اللغة التي سيتحدث بها نوفا معك.</p>
                  </div>
                  <Select 
                    value={settings.language} 
                    onValueChange={(v) => setSettings(s => ({...s, language: v}))}
                  >
                    <SelectTrigger className="w-44 rounded-2xl ultra-glass border-white/10 h-14 font-bold text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl ultra-glass border-white/10 backdrop-blur-3xl text-white">
                      <SelectItem value="ar">العربية (نوفا)</SelectItem>
                      <SelectItem value="en">English (Nova)</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* AI Interaction Card */}
            <Card className="ultra-glass border-white/5 rounded-[3rem] p-4 flex flex-col">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black flex items-center gap-4 text-white">
                  <div className="p-3 rounded-2xl bg-secondary/20 text-secondary">
                    <BellRing className="w-7 h-7" />
                  </div>
                  تفاعل نوفا الذكي
                </CardTitle>
                <CardDescription className="text-muted-foreground/60">خصص طريقة استجابة Nova للأوامر الصوتية.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 p-8 pt-0 flex-1">
                <div className="flex items-center justify-between p-8 rounded-[2rem] bg-gradient-to-l from-white/5 to-transparent border border-white/5">
                  <div className="space-y-1">
                    <Label className="text-lg font-black text-white flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-secondary" />
                      النطق التلقائي
                    </Label>
                    <p className="text-xs text-muted-foreground">اجعل نوفا تقرأ الردود بصوت عالٍ فورياً.</p>
                  </div>
                  <Switch 
                    checked={settings.autoSpeak} 
                    onCheckedChange={(v) => setSettings(s => ({...s, autoSpeak: v}))}
                    className="data-[state=checked]:bg-secondary scale-125"
                  />
                </div>

                <div className="space-y-6">
                  <Label className="text-sm font-black uppercase text-muted-foreground tracking-widest block">نبرة صوت المساعد</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'default', label: 'صوت هادئ (Nova)', desc: 'مثالي للاستخدام اليومي' },
                      { id: 'pro', label: 'صوت احترافي', desc: 'رسمي ومحدد' }
                    ].map((v) => (
                      <button 
                        key={v.id}
                        className={cn(
                          "p-6 flex flex-col gap-2 rounded-[2rem] border text-right transition-all",
                          settings.voiceName === v.id 
                            ? "bg-secondary/20 border-secondary text-white" 
                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                        )}
                        onClick={() => setSettings(s => ({...s, voiceName: v.id}))}
                      >
                        <span className="text-sm font-black">{v.label}</span>
                        <span className="text-[10px] opacity-60 font-bold">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white mb-1">تزامن البيانات</p>
                    <p className="text-[10px] text-muted-foreground">يتم حفظ جميع إعداداتك بشكل مشفر في السحابة.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
