/**
 * Hlasová služba pro plynulé a přirozené čtení Pána Jeskyně v ryzí češtině
 * Využívá nativní českou hlasovou syntézu přes /api/tts (přirozená česká výslovnost s diakritikou)
 * s plynulou frontou a automatickým přednačítáním následujících vět.
 */

class SpeechService {
  private currentAudio: HTMLAudioElement | null = null;
  private sentenceQueue: string[] = [];
  private isProcessingQueue: boolean = false;
  private onQueueFinishedCallback: (() => void) | null = null;
  private synth: SpeechSynthesis | null = null;
  private czechVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initBrowserVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.initBrowserVoices();
        }
      }
    }
  }

  private initBrowserVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      const cs = voices.find(v => v.lang.startsWith('cs') || v.lang.includes('Czech') || v.name.includes('Czech'));
      if (cs) {
        this.czechVoice = cs;
      }
    } catch {}
  }

  private cleanSentence(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, '') // Odstranit kódové bloky
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/>/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/kabala_json/g, '')
      .trim();
  }

  /**
   * Přečte celý text najednou
   */
  public speak(text: string, onEnd?: () => void, onError?: () => void) {
    this.stop();

    const cleanText = this.cleanSentence(text);
    if (!cleanText) return;

    // Primárně použijeme nativní českou syntézu (garance perfektní české výslovnosti)
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.playbackRate = 0.98;

      audio.onended = () => {
        this.currentAudio = null;
        onEnd?.();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        // Fallback na prohlížeč
        this.fallbackBrowserSpeak(cleanText, onEnd, onError);
      };

      audio.play().catch(() => {
        this.fallbackBrowserSpeak(cleanText, onEnd, onError);
      });
    } catch {
      this.fallbackBrowserSpeak(cleanText, onEnd, onError);
    }
  }

  /**
   * Přidá větu do fronty pro okamžité streamované předčítání (hráč nečeká na celý odstavec)
   */
  public enqueueSentence(sentence: string, onAllDone?: () => void) {
    if (onAllDone) {
      this.onQueueFinishedCallback = onAllDone;
    }

    const clean = this.cleanSentence(sentence);
    if (!clean || clean.length < 2) return;

    this.sentenceQueue.push(clean);

    if (!this.isProcessingQueue) {
      this.processNextInQueue();
    }
  }

  private processNextInQueue() {
    if (this.sentenceQueue.length === 0) {
      this.isProcessingQueue = false;
      this.currentAudio = null;
      this.onQueueFinishedCallback?.();
      this.onQueueFinishedCallback = null;
      return;
    }

    this.isProcessingQueue = true;
    const text = this.sentenceQueue.shift();
    if (!text) {
      this.processNextInQueue();
      return;
    }

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(text)}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.playbackRate = 0.98;

      // Přednačteme hned následující větu z fronty pro plynulý přechod bez prodlevy
      if (this.sentenceQueue.length > 0) {
        const nextUrl = `/api/tts?text=${encodeURIComponent(this.sentenceQueue[0])}`;
        const preloader = new Audio(nextUrl);
        preloader.load();
      }

      audio.onended = () => {
        this.processNextInQueue();
      };

      audio.onerror = () => {
        // Při chybě sítě zkusíme fallback na browser nebo pokračujeme na další větu
        this.fallbackBrowserSpeak(text, () => this.processNextInQueue(), () => this.processNextInQueue());
      };

      audio.play().catch((err) => {
        console.warn('Audio play prevented (čeká se na interakci uživatele):', err);
        this.processNextInQueue();
      });
    } catch {
      this.processNextInQueue();
    }
  }

  private fallbackBrowserSpeak(text: string, onEnd?: () => void, onError?: () => void) {
    if (!this.synth) {
      onError?.();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.czechVoice) {
        utterance.voice = this.czechVoice;
        utterance.lang = this.czechVoice.lang;
      } else {
        utterance.lang = 'cs-CZ';
      }
      utterance.pitch = 0.95;
      utterance.rate = 0.98;
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onError?.();
      this.synth.speak(utterance);
    } catch {
      onError?.();
    }
  }

  /**
   * Okamžité zastavení veškerého zvuku a vymazání fronty
   */
  public stop() {
    this.sentenceQueue = [];
    this.isProcessingQueue = false;
    this.onQueueFinishedCallback = null;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      try {
        this.synth.cancel();
      } catch {}
    }
  }

  public isSpeaking(): boolean {
    return this.isProcessingQueue || (this.currentAudio !== null && !this.currentAudio.paused);
  }
}

export const speechService = new SpeechService();
