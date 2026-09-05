/**
 * Web Speech API utility pro hlasové předčítání Pána Jeskyně v češtině
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private czechVoice: SpeechSynthesisVoice | null = null;

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
    // Hledáme český hlas (např. cs-CZ, Czech)
    const cs = voices.find(v => v.lang.startsWith('cs') || v.lang.includes('Czech'));
    if (cs) {
      this.czechVoice = cs;
    }
  }

  public speak(text: string, onEnd?: () => void, onError?: () => void) {
    if (!this.synth) return;

    // Zastavíme předchozí mluvení
    this.stop();

    // Vyčistíme text od markdownových symbolů a asteriků pro přirozené čtení
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/>/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.czechVoice) {
      utterance.voice = this.czechVoice;
      utterance.lang = this.czechVoice.lang;
    } else {
      utterance.lang = 'cs-CZ';
    }

    // Nastavení tajemnějšího a hlubšího tónu pro Pána Jeskyně
    utterance.pitch = 0.92;
    utterance.rate = 0.96;

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onError?.();
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }
}

export const speechService = new SpeechService();
