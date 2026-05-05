
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, Chrome, Lock, UserPlus, LogIn, ChevronRight, Sparkles, Languages, MessageSquare, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const NOVA_LOGO = "https://images.unsplash.com/photo-1675249168121-160dc199e69e?q=80&w=1000&auto=format&fit=crop";

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.push('/');
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;
    setIsLoading(true);
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#050406] flex items-center justify-center p-6 font-arabic overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[180px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/20 rounded-full blur-[180px] animate-pulse delay-1000" />

      <div className="max-w-md w-full space-y-12 relative z-10">
        <div className="text-center space-y-8">
          <div className="relative inline-block animate-float">
            <div className="absolute inset-0 bg-primary/40 blur-[60px] rounded-full animate-pulse-glow" />
            <div className="relative w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center nova-glow shadow-2xl overflow-hidden">
              <img src={NOVA_LOGO} alt="Nova AI Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tighter nova-text-glow">NOVA AI</h1>
            <p className="text-muted-foreground text-xl font-medium">مساعدك الذكي في كل لحظة</p>
          </div>
        </div>

        <div className="flex justify-center gap-6 py-4">
          {[
            { icon: Mail, label: 'الرسائل' },
            { icon: Mic, label: 'صوتك' },
            { icon: Languages, label: 'لغات' },
            { icon: MessageSquare, label: 'تحدث' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl ultra-glass flex items-center justify-center text-white">
                <f.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-muted-foreground font-bold">{f.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <Input 
              type="email" 
              placeholder="البريد الإلكتروني" 
              className="h-16 rounded-2xl ultra-glass border-white/10 px-8 text-lg" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              type="password" 
              placeholder="كلمة المرور" 
              className="h-16 rounded-2xl ultra-glass border-white/10 px-8 text-lg" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              type="submit"
              className="w-full h-20 rounded-full nova-gradient text-white text-2xl font-black shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-between px-10"
              disabled={isLoading}
            >
              <span>{isLogin ? 'ابدأ الآن' : 'انضم إلينا'}</span>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </div>
            </Button>
          </form>

          <Button 
            variant="ghost" 
            className="w-full h-16 rounded-2xl ultra-glass text-white font-bold gap-4 hover:bg-white/10"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="w-6 h-6 text-primary" />
            الدخول عبر Google
          </Button>

          <Button 
            variant="link" 
            className="w-full text-primary font-black text-lg"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'ليس لديك حساب؟ اشترك مجاناً' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-sm font-bold opacity-50">
          💜 مرحباً بك في عالم الذكاء
        </p>
      </div>
    </div>
  );
}
