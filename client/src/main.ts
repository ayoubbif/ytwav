import "./style.css";

interface ConversionResponse {
  success: boolean;
  message: string;
  filename: string;
  error?: string;
}

class YoutubeConverter {
  private apiUrl = "http://localhost:5000";
  private form!: HTMLFormElement;
  private urlInput!: HTMLInputElement;
  private status!: HTMLDivElement;

  constructor() {
    this.initializeUI();
    this.setupEventListeners();
  }

  private initializeUI() {
    const app = document.querySelector<HTMLDivElement>("#app")!;
    app.innerHTML = `
      <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">YouTube to WAV Converter</h1>
        <form id="converter-form" class="space-y-4">
          <div>
            <label for="url" class="block mb-2">YouTube URL:</label>
            <input type="url" id="url" required 
              class="w-full p-2 border rounded"
              placeholder="https://www.youtube.com/watch?v=...">
          </div>
          <button type="submit" 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Convert to WAV
          </button>
        </form>
        <div id="status" class="mt-4"></div>
      </div>
    `;

    this.form = document.querySelector<HTMLFormElement>("#converter-form")!;
    this.urlInput = document.querySelector<HTMLInputElement>("#url")!;
    this.status = document.querySelector<HTMLDivElement>("#status")!;
  }

  private setupEventListeners() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }
.
  private async handleSubmit() {
    const url = this.urlInput.value;
    if (!url) return;

    this.updateStatus("Converting...", "info");

    try {
      const response = await fetch(`${this.apiUrl}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data: ConversionResponse = await response.json();

      if (data.success) {
        this.updateStatus("Conversion successful! Downloading...", "success");
        await this.downloadFile(data.filename);
      } else {
        this.updateStatus(`Error: ${data.error}`, "error");
      }
    } catch (error) {
      this.updateStatus(`Error: ${error}`, "error");
    }
  }

  private async downloadFile(filename: string) {
    window.location.href = `${this.apiUrl}/download/${filename}`;
  }

  private updateStatus(message: string, type: "info" | "success" | "error") {
    const colors = {
      info: "text-blue-600",
      success: "text-green-600",
      error: "text-red-600",
    };

    this.status.innerHTML = `
      <div class="${colors[type]} p-4 rounded">
        ${message}
      </div>
    `;
  }
}

new YoutubeConverter();
