
"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, Mic, MicOff, Sparkles, Settings as SettingsIcon, 
  LayoutGrid, BarChart2, Paperclip, Image as ImageIcon, 
  FileText, Video, Plus, X, Monitor, Smartphone, Tv, Volume2, Power, Square, 
  ChevronLeft, ChevronRight, Volume1, VolumeX, Radio, Wifi, Bluetooth, Moon, Sun, 
  RefreshCw, Maximize, Smartphone as PhoneIcon, Laptop, Thermometer, Bell, Zap,
  PlaySquare, Cpu, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NovaSidebar } from '@/components/navigation/sidebar';
import { novaAIChat } from '@/ai/flows/nova-ai-chat-flow';
import { useSpeech, type LanguageCode } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from 'next/link';

type ToolCategory = 'main' | 'tv' | 'phone' | 'audio' | 'display' | 'system';

const APP_URLS: Record<string, string> = {
  'يوتيوب': 'https://www.youtube.com',
  'نتفلكس': 'https://www.netflix.com',
  'فيسبوك': 'https://www.facebook.com',
  'تويتر': 'https://www.twitter.com',
  'انستجرام': 'https://www.instagram.com',
  'واتساب': 'https://web.whatsapp.com',
  'youtube': 'https://www.youtube.com',
  'netflix': 'https://www.netflix.com',
};

const NOVA_LOGO = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop";

export default function ChatPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('main');
  const [attachedFile, setAttachedFile] = useState<{ file: File, preview: string, type: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useDoc(user && db ? doc(db, 'users', user.uid) : null);
  const language = (profile?.preferences?.language as LanguageCode) || 'ar';
  const autoSpeak = profile?.preferences?.autoSpeak || false;

  const messagesQuery = user && db ? query(
    collection(db, 'users', user.uid, 'chats', 'default', 'messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  ) : null;
  
  const { data: messages = [] } = useCollection<any>(messagesQuery);
  const { isListening, transcript, startListening, stopListening, speak, setTranscript } = useSpeech();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const handleToolAction = (action: string, detail: string) => {
    toast({
      title: `تم تنفيذ أمر: ${action}`,
      description: `جاري ${detail} عبر الرابط العصبي Nova...`,
    });
    
    const appName = detail.toLowerCase();
    for (const [key, url] of Object.entries(APP_URLS)) {
      if (appName.includes(key)) {
        window.open(url, '_blank');
        return;
      }
    }

    if (autoSpeak) speak(`تم تنفيذ أمر ${action} لـ ${detail}`, language);
  };

  useEffect(() => {
    if (transcript && user && db) {
      const cmd = transcript.toLowerCase();
      
      if (cmd.includes('افتح الإحصائيات') || cmd.includes('analytics')) {
        speak("جاري فتح الإحصائيات", language);
        router.push('/analytics');
        setTranscript('');
      } 
      else if (cmd.includes('افتح الإعدادات') || cmd.includes('settings')) {
        speak("جاري فتح الإعدادات", language);
        router.push('/settings');
        setTranscript('');
      } 
      else if (cmd.includes('الوضع الليلي') || cmd.includes('dark mode')) {
        setDoc(doc(db, 'users', user.uid), { preferences: { theme: 'dark' } }, { merge: true });
        document.documentElement.classList.add('dark');
        speak("تم تفعيل الوضع الليلي", language);
        setTranscript('');
      }
      else if (cmd.includes('افتح تطبيق') || cmd.includes('شغل تطبيق') || cmd.includes('افتح')) {
        const appNameMatch = cmd.match(/(?:افتح تطبيق|شغل تطبيق|افتح)\s+(.+)/);
        if (appNameMatch && appNameMatch[1]) {
          const appName = appNameMatch[1].trim();
          handleToolAction('فتح تطبيق', appName);
          setTranscript('');
        } else {
          handleSend(transcript);
          setTranscript('');
        }
      }
      else {
        handleSend(transcript);
        setTranscript('');
      }
    }
  }, [transcript]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isLoading, attachedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          file: file,
          preview: reader.result as string,
          type: file.type.split('/')[0]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim();
    if ((!messageText && !attachedFile) || isLoading || !user || !db) return;

    const currentFile = attachedFile;
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const messagesRef = collection(db, 'users', user.uid, 'chats', 'default', 'messages');
      
      await addDoc(messagesRef, {
        role: 'user',
        content: messageText,
        attachment: currentFile ? { preview: currentFile.preview, type: currentFile.type, name: currentFile.file.name } : null,
        timestamp: serverTimestamp(),
      });

      const result = await novaAIChat({ 
        prompt: messageText || "حلل هذا المرفق من فضلك", 
        language,
        photoDataUri: currentFile?.type === 'image' ? currentFile.preview : undefined
      });
      
      if (!result || !result.response) {
        throw new Error("لم يتم استلام رد صحيح من نوفا");
      }

      await addDoc(messagesRef, {
        role: 'assistant',
        content: result.response,
        timestamp: serverTimestamp(),
      });

      if (autoSpeak) speak(result.response, language);
    } catch (error: any) {
      console.error("Nova Chat Error:", error);
      toast({ 
        variant: "destructive", 
        title: "فشل الإرسال", 
        description: "حدث خطأ أثناء التواصل مع نوفا. يرجى التحقق من الاتصال والمحاولة مرة أخرى." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="flex h-screen bg-[#050406] overflow-hidden font-arabic" dir="rtl">
      <NovaSidebar />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-24 flex items-center justify-between px-8 bg-[#050406]/60 backdrop-blur-xl border-b border-white/[0.05] z-30">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl ultra-glass">
              <img src={NOVA_LOGO} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white nova-text-glow">نوفا AI</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Neural Connect Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-2xl ultra-glass h-12 w-12 text-white hover:text-primary" onClick={() => { setActiveCategory('main'); setIsToolsOpen(true); }}>
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Link href="/analytics">
              <Button variant="ghost" size="icon" className="rounded-2xl ultra-glass h-12 w-12 text-white hover:text-primary">
                <BarChart2 className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-2xl ultra-glass h-12 w-12 text-white hover:text-primary">
                <SettingsIcon className="w-5 h-5" />
              </Button>
            </Link>
            <Avatar className="w-12 h-12 border border-white/10 rounded-2xl">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-primary/20 text-primary font-black">U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <ScrollArea className="flex-1 px-4 md:px-8 py-6" scrollAreaViewportRef={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.length === 0 && !attachedFile && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                <div className="relative group">
                  <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all" />
                  <div className="relative w-40 h-40 rounded-full flex items-center justify-center nova-glow bg-gradient-to-br from-primary via-secondary to-primary animate-float overflow-hidden">
                    <img src={NOVA_LOGO} alt="Nova AI" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white tracking-tighter">مرحباً صديقي 👋</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">أنا جاهز لمساعدتك في أي وقت ورؤية ملفاتك وصورك. ماذا نحتاج أن نفعل اليوم؟</p>
                </div>
              </div>
            )}

            {messages.map((m: any) => (
              <div key={m.id} className={cn("flex items-end gap-4 animate-in fade-in slide-in-from-bottom-4", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <Avatar className="w-10 h-10 rounded-xl border border-white/5 shrink-0 overflow-hidden">
                  <AvatarImage src={m.role === 'assistant' ? NOVA_LOGO : user?.photoURL || ''} />
                  <AvatarFallback className="bg-primary/20 text-primary">N</AvatarFallback>
                </Avatar>
                <div className="space-y-2 max-w-[80%]">
                  {m.attachment && (
                    <div className="rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl">
                      {m.attachment.type === 'image' ? (
                        <img src={m.attachment.preview} alt="Attached" className="max-w-full h-auto" />
                      ) : (
                        <div className="p-4 ultra-glass flex items-center gap-3">
                          <FileText className="w-6 h-6 text-primary" />
                          <span className="text-white text-sm font-bold">{m.attachment.name || 'ملف مرفق'}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {m.content && (
                    <div className={cn(
                      "px-6 py-4 rounded-[1.5rem] text-white text-lg font-medium shadow-2xl",
                      m.role === 'user' ? "bg-primary rounded-br-none" : "ultra-glass rounded-bl-none"
                    )}>
                      {m.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 rounded-xl border border-white/5 shrink-0 overflow-hidden">
                  <AvatarImage src={NOVA_LOGO} />
                  <AvatarFallback className="bg-primary/20 text-primary">N</AvatarFallback>
                </Avatar>
                <div className="ultra-glass px-6 py-4 rounded-3xl rounded-bl-none">
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-8 md:px-20 pb-12 bg-gradient-to-t from-[#050406] via-[#050406]/80 to-transparent">
          <div className="max-w-4xl mx-auto space-y-4">
            {attachedFile && (
              <div className="p-4 ultra-glass rounded-[1.5rem] flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                  {attachedFile.type === 'image' ? (
                    <img src={attachedFile.preview} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-white text-xs font-black">{attachedFile.file.name}</p>
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">{attachedFile.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-red-400 hover:bg-red-400/10" onClick={() => setAttachedFile(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-4 ultra-glass p-3 rounded-[2.5rem] nova-glow">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-full w-14 h-14 ultra-glass text-white hover:bg-primary/20 shrink-0">
                    <Plus className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="ultra-glass border-white/10 rounded-2xl w-48 mb-4">
                  <DropdownMenuItem onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } }} className="flex items-center gap-3 h-12 rounded-xl text-white hover:bg-primary/20 cursor-pointer">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="font-bold">إرسال صورة</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = "*/*"; fileInputRef.current.click(); } }} className="flex items-center gap-3 h-12 rounded-xl text-white hover:bg-primary/20 cursor-pointer">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="font-bold">إرسال ملف</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="تحدث مع نوفا..."
                className="flex-1 bg-transparent border-none text-white text-lg placeholder:text-muted-foreground/30 focus-visible:ring-0"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />

              <Button 
                size="icon" 
                variant="ghost"
                className={cn(
                  "w-14 h-14 rounded-full transition-all shrink-0", 
                  isListening ? "bg-red-500 text-white animate-pulse" : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                onClick={() => isListening ? stopListening() : startListening(language)}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              <Button 
                size="icon" 
                className={cn(
                  "w-14 h-14 rounded-full shadow-xl shrink-0 transition-all active:scale-95",
                  isLoading ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-white text-black hover:bg-white/90"
                )}
                onClick={() => isLoading ? setIsLoading(false) : handleSend()}
                disabled={(!input.trim() && !attachedFile) && !isLoading}
              >
                {isLoading ? <Square className="w-6 h-6" /> : <Send className="w-6 h-6 rotate-180" />}
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={isToolsOpen} onOpenChange={setIsToolsOpen}>
          <DialogContent className="ultra-glass border-white/10 rounded-[3rem] max-w-2xl p-8 bg-[#050406]/95">
            <DialogHeader className="flex flex-row items-center justify-center relative">
              {activeCategory !== 'main' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 rounded-full ultra-glass" 
                  onClick={() => setActiveCategory('main')}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </Button>
              )}
              <DialogTitle className="text-2xl font-black text-white nova-text-glow text-center mb-6">
                {activeCategory === 'main' && 'مركز تحكم Nova الذكي'}
                {activeCategory === 'tv' && 'التحكم في التلفاز'}
                {activeCategory === 'phone' && 'إعدادات الهاتف'}
                {activeCategory === 'audio' && 'نظام الصوت المحيطي'}
                {activeCategory === 'display' && 'شاشة العرض الرئيسية'}
                {activeCategory === 'system' && 'إيقاف النظام'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {activeCategory === 'main' && (
                <>
                  {[
                    { id: 'tv', label: 'تلفاز ذكي', icon: Tv, color: 'text-primary' },
                    { id: 'phone', label: 'إعدادات الهاتف', icon: Smartphone, color: 'text-blue-400' },
                    { id: 'audio', label: 'نظام الصوت', icon: Volume2, color: 'text-teal-400' },
                    { id: 'display', label: 'شاشة العرض', icon: Monitor, color: 'text-purple-400' },
                    { id: 'system', label: 'إيقاف النظام', icon: Power, color: 'text-red-400' }
                  ].map((tool, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      className="h-32 flex flex-col gap-3 ultra-glass rounded-[2rem] hover:bg-white/5 border-white/5" 
                      onClick={() => setActiveCategory(tool.id as ToolCategory)}
                    >
                      <tool.icon className={cn("w-8 h-8", tool.color)} />
                      <span className="font-bold">{tool.label}</span>
                    </Button>
                  ))}
                </>
              )}

              {activeCategory === 'tv' && (
                <>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('تغيير القناة', 'التنقل للقناة التالية')}>
                    <ChevronRight className="w-6 h-6 text-primary" />
                    <span>القناة +</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('تغيير القناة', 'العودة للقناة السابقة')}>
                    <ChevronLeft className="w-6 h-6 text-primary" />
                    <span>القناة -</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('مستوى الصوت', 'رفع مستوى صوت التلفاز')}>
                    <Volume2 className="w-6 h-6 text-blue-400" />
                    <span>رفع الصوت</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('مستوى الصوت', 'خفض مستوى صوت التلفاز')}>
                    <Volume1 className="w-6 h-6 text-blue-400" />
                    <span>خفض الصوت</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('تطبيقات التلفاز', 'فتح قائمة تطبيقات التلفاز')}>
                    <PlaySquare className="w-6 h-6 text-red-500" />
                    <span>فتح تطبيق</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem] border-red-500/20" onClick={() => handleToolAction('الطاقة', 'إيقاف تشغيل التلفاز')}>
                    <Power className="w-6 h-6 text-red-500" />
                    <span>إغلاق</span>
                  </Button>
                </>
              )}

              {activeCategory === 'phone' && (
                <>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('الإضاءة', 'رفع سطوع الشاشة')}>
                    <Sun className="w-6 h-6 text-yellow-400" />
                    <span>السطوع +</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('الشبكة', 'تفعيل Wi-Fi')}>
                    <Wifi className="w-6 h-6 text-blue-400" />
                    <span>Wi-Fi</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('تطبيقات الهاتف', 'فتح قائمة تطبيقات الهاتف المتاحة')}>
                    <LayoutGrid className="w-6 h-6 text-primary" />
                    <span>التطبيقات</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('تنبيه', 'تفعيل وضع عدم الإزعاج')}>
                    <Moon className="w-6 h-6 text-purple-400" />
                    <span>وضع النوم</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('نوفا ترى', 'تفعيل الكاميرا عبر رؤية نوفا')}>
                    <img src={NOVA_LOGO} alt="Nova View" className="w-7 h-7 rounded-lg object-cover" />
                    <span>رؤية نوفا</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('إشعار', 'إرسال إشعار تجريبي')}>
                    <Bell className="w-6 h-6 text-primary" />
                    <span>إشعارات</span>
                  </Button>
                </>
              )}

              {activeCategory === 'audio' && (
                <>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('الصوت', 'تشغيل الموسيقى المحيطية')}>
                    <Radio className="w-6 h-6 text-primary" />
                    <span>تشغيل</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('الصوت', 'كتم كافة الأصوات')}>
                    <VolumeX className="w-6 h-6 text-red-400" />
                    <span>كتم</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('توازن', 'ضبط توازن الصوت')}>
                    <RefreshCw className="w-6 h-6 text-blue-400" />
                    <span>توازن</span>
                  </Button>
                </>
              )}

              {activeCategory === 'display' && (
                <>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('الشاشة', 'تغيير دقة العرض إلى 4K')}>
                    <Maximize className="w-6 h-6 text-purple-400" />
                    <span>دقة 4K</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('المظهر', 'تفعيل وضع حماية العين')}>
                    <Thermometer className="w-6 h-6 text-orange-400" />
                    <span>فلتر أزرق</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex flex-col gap-2 ultra-glass rounded-[2rem]" onClick={() => handleToolAction('اتصال', 'توصيل شاشة ثانوية')}>
                    <Laptop className="w-6 h-6 text-teal-400" />
                    <span>شاشة ثانية</span>
                  </Button>
                </>
              )}

              {activeCategory === 'system' && (
                <div className="col-span-full flex flex-col items-center gap-6 py-8">
                  <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <Power className="w-12 h-12 text-red-500 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-white font-black text-xl">هل أنت متأكد من إيقاف النظام؟</p>
                    <p className="text-muted-foreground text-sm">سيتم قطع الرابط العصبي مع Nova AI فوراً.</p>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="destructive" className="px-10 h-14 rounded-2xl font-black" onClick={() => { setIsToolsOpen(false); router.push('/login'); }}>تأكيد الإغلاق</Button>
                    <Button variant="outline" className="px-10 h-14 rounded-2xl ultra-glass font-black" onClick={() => setActiveCategory('main')}>إلغاء</Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
