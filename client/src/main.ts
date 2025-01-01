interface ConversionResponse {
  success: boolean;
  message: string;
  filename: string;
  audio_data: string;
  error?: string;
}

class YoutubeConverter {
  private apiUrl = "http://localhost:5000";
  private form!: HTMLFormElement;
  private urlInput!: HTMLInputElement;
  private status!: HTMLDivElement;
  private progressWrapper!: HTMLDivElement;
  private progressValue!: HTMLDivElement;
  private progressText!: HTMLDivElement;
  private submitButton!: HTMLButtonElement;
  private downloadSection!: HTMLDivElement;
  private downloadButton!: HTMLButtonElement;
  private filename!: HTMLSpanElement;
  private fileSize!: HTMLSpanElement;
  private steps!: NodeListOf<HTMLDivElement>;
  private currentAudioData: string | null = null;
  private currentFilename: string | null = null;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements() {
    this.form = document.querySelector<HTMLFormElement>("#converter-form")!;
    this.urlInput = document.querySelector<HTMLInputElement>("#url")!;
    this.status = document.querySelector<HTMLDivElement>("#status")!;
    this.progressWrapper =
      document.querySelector<HTMLDivElement>(".progress-wrapper")!;
    this.progressValue =
      document.querySelector<HTMLDivElement>(".progress-value")!;
    this.progressText =
      document.querySelector<HTMLDivElement>(".progress-text")!;
    this.submitButton = this.form.querySelector("button")!;
    this.downloadSection =
      document.querySelector<HTMLDivElement>("#download-section")!;
    this.downloadButton =
      document.querySelector<HTMLButtonElement>("#download-button")!;
    this.filename = document.querySelector<HTMLSpanElement>("#filename")!;
    this.fileSize = document.querySelector<HTMLSpanElement>("#file-size")!;
    this.steps = document.querySelectorAll<HTMLDivElement>(".step");
  }

  private setupEventListeners() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.resetUI();
      await this.handleSubmit();
    });

    this.downloadButton.addEventListener("click", () => {
      if (this.currentAudioData && this.currentFilename) {
        this.downloadFile(this.currentAudioData, this.currentFilename);
      }
    });
  }

  private resetUI() {
    this.progressValue.style.width = "0%";
    this.progressText.textContent = "0%";
    this.status.innerHTML = "";
    this.downloadSection.classList.add("hidden");
    this.progressWrapper.classList.remove("hidden");
    this.updateSteps(1);
  }

  private updateProgress(percent: number) {
    this.progressValue.style.width = `${percent}%`;
    this.progressText.textContent = `${percent}%`;
  }

  private updateSteps(step: number) {
    this.steps.forEach((stepEl) => {
      const stepNum = parseInt(stepEl.dataset.step || "1");
      stepEl.classList.toggle("active", stepNum <= step);
    });
  }

  private async handleSubmit() {
    const url = this.urlInput.value;
    if (!url) return;

    this.updateStatus("Converting...", "info");
    this.toggleSubmitButton(true);
    this.updateProgress(10);

    try {
      const response = await fetch(`${this.apiUrl}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      this.updateProgress(50);
      const data: ConversionResponse = await response.json();

      if (data.success) {
        this.updateProgress(100);
        this.updateStatus("Conversion successful!", "success");
        this.updateSteps(2);
        this.showDownloadSection(data.filename, data.audio_data);
      } else {
        throw new Error(data.error || "Conversion failed");
      }
    } catch (error) {
      this.updateStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
      this.updateProgress(0);
    } finally {
      this.toggleSubmitButton(false);
      this.progressWrapper.classList.add("hidden");
    }
  }

  private showDownloadSection(filename: string, audioData: string) {
    const size =
      Math.round(((audioData.length * 3) / 4 / (1024 * 1024)) * 100) / 100;

    this.currentAudioData = audioData;
    this.currentFilename = filename;
    this.filename.textContent = filename;
    this.fileSize.textContent = `${size} MB`;
    this.downloadSection.classList.remove("hidden");
  }

  private toggleSubmitButton(disabled: boolean) {
    this.submitButton.disabled = disabled;
    this.submitButton.textContent = disabled ? "Converting..." : "Convert";
  }

  private async downloadFile(audioData: string, filename: string) {
    const byteCharacters = atob(audioData);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private updateStatus(message: string, type: "info" | "success" | "error") {
    this.status.className = `status status-${type}`;
    this.status.textContent = message;
  }
}

new YoutubeConverter();
