/**
 * Web Speech API utility pro plynulé a streamované hlasové předčítání Pána Jeskyně
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private czechVoice: SpeechSynthesisVoice | null = null;
  private sentenceQueue: string[] = [];
  private isProcessingQueue: boolean = false;
  private onQueueFinishedCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Hledáme český hlas
    const cs = voices.find(v => v.lang.startsWith('cs') || v.lang.includes('Czech'));
    if (cs) {
      this.czechVoice = cs;
    }
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
    if (!this.synth) return;
    this.stop();

    const cleanText = this.cleanSentence(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.czechVoice) {
      utterance.voice = this.czechVoice;
      utterance.lang = this.czechVoice.lang;
    } else {
      utterance.lang = 'cs-CZ';
    }

    utterance.pitch = 0.92;
    utterance.rate = 0.96;

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onError?.();

    this.synth.speak(utterance);
  }

  /**
   * Přidá větu do fronty pro okamžité streamované předčítání
   */
  public enqueueSentence(sentence: string, onAllDone?: () => void) {
    if (!this.synth) return;

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
    if (!this.synth) return;

    if (this.sentenceQueue.length === 0) {
      this.isProcessingQueue = false;
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

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.czechVoice) {
      utterance.voice = this.czechVoice;
      utterance.lang = this.czechVoice.lang;
    } else {
      utterance.lang = 'cs-CZ';
    }

    utterance.pitch = 0.92;
    utterance.rate = 0.96;

    utterance.onend = () => {
      this.processNextInQueue();
    };

    utterance.onerror = () => {
      this.processNextInQueue();
    };

    this.synth.speak(utterance);
  }

  /**
   * Okamžité zastavení veškerého zvuku a vymazání fronty
   */
  public stop() {
    this.sentenceQueue = [];
    this.isProcessingQueue = false;
    this.onQueueFinishedCallback = null;
    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return !!this.synth && (this.synth.speaking || this.isProcessingQueue);
  }
}

export const speechService = new SpeechService();
